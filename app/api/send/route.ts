import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseClient, fetchAllRows } from "@/lib/supabase";
import { nextStepFor, STEP_NEW_STATUS, EmailStep as SendableStep } from "@/lib/leads";
import { renderTemplate } from "@/lib/templates";
import { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

const DAILY_LIMIT = 15;
const CTA_LINK = "https://lsgrowth.agency/book";
const APP_URL = process.env.APP_URL || "https://app.lsgrowth.agency";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type QueueItem = { lead: Lead; step: Exclude<SendableStep, "checkin"> };

// Resend allows 2 requests/sec; spacing sends out keeps us under that.
const SEND_INTERVAL_MS = 550;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Oldest-due first, so a flood of freshly added leads can't push older
// overdue leads out of the daily cap indefinitely.
function priorityDate(lead: Lead): number {
  const d = lead.last_followup || lead.date_contacted || lead.date_added;
  return d ? new Date(d).getTime() : 0;
}

async function buildQueue(sb: ReturnType<typeof createSupabaseClient>, leadIds?: string[]): Promise<QueueItem[]> {
  const allLeads = await fetchAllRows<Lead>((from, to) =>
    sb.from("leads").select("*").order("date_added", { ascending: false }).range(from, to)
  );

  const due = allLeads
    .map((lead) => {
      const step = nextStepFor(lead);
      if (!step || step === "checkin") return null;
      return { lead, step };
    })
    .filter((x): x is QueueItem => x !== null);

  if (leadIds && leadIds.length > 0) {
    const idSet = new Set(leadIds);
    return due.filter((d) => idSet.has(d.lead.lead_id));
  }

  due.sort((a, b) => priorityDate(a.lead) - priorityDate(b.lead));
  return due.slice(0, DAILY_LIMIT);
}

async function handleSend(leadIds?: string[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { sent: 0, failed: 0, skipped: 0, errors: ["RESEND_API_KEY is not set"] },
      { status: 500 }
    );
  }
  const fromAddress = process.env.RESEND_FROM_EMAIL;
  if (!fromAddress) {
    return NextResponse.json(
      { sent: 0, failed: 0, skipped: 0, errors: ["RESEND_FROM_EMAIL is not set"] },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);
  const sb = createSupabaseClient();
  const queue = await buildQueue(sb, leadIds);

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const [i, { lead, step }] of queue.entries()) {
    if (!lead.email || !EMAIL_RE.test(lead.email)) {
      skipped++;
      continue;
    }

    if (i > 0) await sleep(SEND_INTERVAL_MS);

    try {
      const trackedCtaLink = `${APP_URL}/api/track/click/${encodeURIComponent(lead.lead_id)}?url=${encodeURIComponent(CTA_LINK)}`;
      const pixel = `<img src="${APP_URL}/api/track/open/${encodeURIComponent(lead.lead_id)}" width="1" height="1" alt="" style="display:none;" />`;
      const unsubscribeLink = `${APP_URL}/api/unsubscribe/${encodeURIComponent(lead.lead_id)}`;

      const { subject, html, text } = renderTemplate(step, {
        company: lead.company,
        contact_name: lead.contact_name || "there",
        trade: lead.trade,
        location: lead.location,
        cta_link: trackedCtaLink,
        pixel,
        personalization: lead.personalization_hook || undefined,
        unsubscribe_link: unsubscribeLink,
      });

      const { error: sendError } = await resend.emails.send({
        from: fromAddress,
        to: lead.email,
        subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${unsubscribeLink}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      if (sendError) throw new Error(sendError.message);

      const now = new Date();
      const today = now.toISOString().slice(0, 10);

      const { error: insertError } = await sb.from("email_sends").insert({
        lead_id: lead.lead_id,
        step,
        subject,
        body_html: html,
        sent_at: now.toISOString(),
      });
      if (insertError) throw new Error(insertError.message);

      const { error: updateError } = await sb
        .from("leads")
        .update({
          status: STEP_NEW_STATUS[step],
          date_contacted: lead.date_contacted || today,
          last_followup: today,
          followup_count: (lead.followup_count || 0) + 1,
        })
        .eq("lead_id", lead.lead_id);
      if (updateError) throw new Error(updateError.message);

      sent++;
    } catch (err) {
      failed++;
      errors.push(`${lead.company}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ sent, failed, skipped, errors });
}

export async function POST(req: NextRequest) {
  let leadIds: string[] | undefined;
  try {
    const body = await req.json();
    leadIds = body?.leadIds;
  } catch {
    // no body — send whatever is due, up to the daily limit
  }
  return handleSend(leadIds);
}

// Vercel Cron hits this with GET and, when CRON_SECRET is set, an
// `Authorization: Bearer <CRON_SECRET>` header — reject anything else so the
// scheduled send can't be triggered by a random request to a public URL.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  return handleSend();
}
