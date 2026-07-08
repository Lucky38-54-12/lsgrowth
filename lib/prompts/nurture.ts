import { Lead } from "@/lib/types";

// Copied to clipboard for pasting into chat to draft a "thinking it over"
// nurture follow-up — draft only, review before sending.
export function nurturePrompt(lead: Lead, callPrepNotes: string | null): string {
  return `Write a short follow-up email to ${lead.company} (contact: ${lead.contact_name || "there"}) who said they needed time to think it over after a proposal call.

Reference ONE specific thing from the call — pull it from these notes: ${callPrepNotes || lead.notes || "(no notes on file — keep it generic but warm)"}.

Restate the guarantee: 10+ qualified quote requests in the first 3 weeks or they don't pay. Propose a specific time to reconnect. Keep it short — no pressure, no "AI"/"automation" language.

Output just the email (subject + body), nothing else.`;
}
