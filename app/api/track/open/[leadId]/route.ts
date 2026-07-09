import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// 1x1 transparent GIF — same pixel used by the legacy email-tracker.js system.
const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(req: NextRequest, { params }: { params: { leadId: string } }) {
  const leadId = params.leadId;

  if (leadId) {
    const sb = createSupabaseClient();
    await sb.from("email_events").insert({
      lead_id: leadId,
      event_type: "open",
      url: null,
      user_agent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for"),
    });
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
