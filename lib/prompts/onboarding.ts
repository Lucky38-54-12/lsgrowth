import { Lead } from "@/lib/types";
import { creativeBriefFor } from "@/lib/creativeBriefs";

// Copied to clipboard for pasting into chat to draft the welcome/onboarding
// email — nothing auto-sends, this always comes back as a draft to review.
export function onboardingEmailPrompt(lead: Lead, niche: string): string {
  const brief = creativeBriefFor(niche);
  return `Write a short, warm welcome/onboarding email for ${lead.company} (contact: ${lead.contact_name || "there"}), a new LS Growth client (niche: ${niche}).

It needs to clearly ask for exactly these four things, personalised to their business:
1. The 3 service lines we're starting campaigns on first (ask them to confirm/pick if not already agreed on the call)
2. Meta Ads Manager / Business Manager access — ask them to add me as a partner
3. Confirmed monthly ad budget
4. Creatives — this brief for their niche: "${brief}"

Tone: personal, not corporate. No "AI", "automation", or "system" language. Reference something specific from their notes if useful: ${lead.notes || "(nothing specific noted)"}.

Output just the email (subject + body), nothing else.`;
}
