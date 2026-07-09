import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const FALLBACK_URL = "https://lsgrowth.agency/book";

export async function GET(req: NextRequest, { params }: { params: { leadId: string } }) {
  const leadId = params.leadId;
  const target = req.nextUrl.searchParams.get("url") || FALLBACK_URL;

  if (leadId) {
    const sb = createSupabaseClient();
    await sb.from("email_events").insert({
      lead_id: leadId,
      event_type: "click",
      url: target,
      user_agent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for"),
    });
  }

  return NextResponse.redirect(target, { status: 302 });
}
