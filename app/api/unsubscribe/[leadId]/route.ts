import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const PAGE = `<!doctype html>
<html>
  <body style="font-family:Arial,Helvetica,sans-serif;padding:60px 20px;text-align:center;color:#334155;">
    <h2 style="margin-bottom:8px;">You've been unsubscribed</h2>
    <p style="color:#64748b;">You won't receive any further emails from LS Growth.</p>
  </body>
</html>`;

export async function GET(req: NextRequest, { params }: { params: { leadId: string } }) {
  const leadId = params.leadId;

  if (leadId) {
    const sb = createSupabaseClient();
    const { data: lead } = await sb.from("leads").select("notes").eq("lead_id", leadId).single();
    const existingNotes = lead?.notes || "";
    const notes = existingNotes ? `${existingNotes}\nUnsubscribed via email link` : "Unsubscribed via email link";

    await sb
      .from("leads")
      .update({ status: "not_interested", reply_category: "not_interested", notes })
      .eq("lead_id", leadId);
  }

  return new NextResponse(PAGE, { status: 200, headers: { "Content-Type": "text/html" } });
}
