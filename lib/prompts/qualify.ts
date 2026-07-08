import { Lead } from "@/lib/types";

// Copied to clipboard for pasting into a Claude Code chat to get an AI
// qualification verdict on a prospect — no live API call from the app.
export function qualifyPrompt(lead: Lead): string {
  return `Research ${lead.company}${lead.website ? ` (${lead.website})` : ""} and tell me if it's a genuine multi-person operation worth calling for LS Growth (a Meta ads lead-gen agency for cleaning/trade businesses in NZ/AU — we need clients with teams of 5-6+ who can handle real lead volume and afford an ongoing retainer).

Check their website for "meet the team" / staff pages, fleet/van photos, multiple branch pages, and any other signal of team size beyond the Apollo-reported employee count (${lead.employee_count ?? "unknown"}).

Reply with exactly two lines:
Verdict: [qualified / borderline / one-man-band]
Reason: [one line — the specific evidence you found]`;
}
