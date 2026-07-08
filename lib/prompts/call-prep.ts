import { CallPrepSheet } from "@/lib/types";

// Tune this file's wording freely — it's what gets copied to the clipboard
// for pasting into a Claude Code chat to generate a call-prep sheet.
// If you send over ls-growth-master-sales-script.md, replace the TEMPLATE
// section below with it verbatim.

const TEMPLATE = `# {{Business Name}} — Discovery Call Sheet
{{Contact name}} · {{Call time & platform}} · {{Phone}} · {{Email}}

**Goal of this call:** NOT to close. It's to (1) qualify on authority, money, pain, and timeline, (2) plant the {{chosen case study}} parallel, and (3) lock a follow-up call to close the pilot off the back of a proposal.

## What you know going in
- 5–8 specific research bullets: services, locations/branches, ticket size estimate, finance/offer hooks, website provider, review presence, ad history signals (pixel / Meta Ad Library), social content style
- Anything from the cold-call notes

## 1. Open (1–2 min)
Natural local/rapport opener, then a one-sentence frame of the call and what it covers (20–30 min).

## 2. Pre-qualification questions (10–12 min)
### A. Authority — can they say yes?
Questions on decision-making structure, who else needs to be in the room.
### B. Pain — where does it hurt?
Where work comes from now, past ad experience, seasonality.
### C. Money — do the economics work?
Job value, close rate, capacity, comfortable ad spend.
### D. Timeline + commitment — will they move?
Rollout pacing, priority level, the money question near the end ("what would stop you from expanding after 3 weeks of 10+ qualified requests?").
Each block gets a one-line "why" coaching note under it.

## 3. The story — case study (3–4 min)
Pick the closest fit and tell it as a story tied to their revealed pain, then bridge to their business:
- Perl Electrical (franchise electrical, Christchurch — 40+ qualified heat pump leads on ~$450/mo, expanded toward group-wide rollout) → multi-branch/trades/high-ticket
- Queenstown Cleaning (30+ booked jobs/month for over a year) → cleaning/volume/retention proof
- All Star Cleaning (multi-service-line Meta campaigns, Wellington) → cleaning with several service lines

Include the word-for-word "what do you actually do" explanation: "we run the ads, every lead is followed up within minutes through our own software, and I personally qualify them by phone — you only ever get booked appointments with people ready for a quote."

## 4. The gap observation (1–2 min)
ONE specific, verifiable thing found in research that proves genuine homework — compliment what's working, then name the gap and why it matters for paid ads.

## 5. The vision — pilot → rollout/scale (2–3 min)
Plug in their hungriest branch/service. Explain the pilot-then-expand approach with their own numbers.

## 6. The offer (only if the call is warm)
The guarantee: 10+ qualified quote requests in 3 weeks or no payment. Use THEIR job-value numbers. Never name a price — that's the proposal on call #2.

## 7. Close the next step (1–2 min)
Lock a specific day/time for the proposal walkthrough before hanging up.

## Objection cheat sheet
Pre-written responses for: "we already have an agency", "tried FB ads, didn't work", "no time to chase leads", a seasonal objection specific to their niche, "send me some info", "what's it cost", plus anything predicted from the cold-call notes.

## Suggested ad angles
1–2 angles specific to their offer (finance hook, seasonal/urgency, before-after visual).

## Post-call checklist
Recap email same day, log money-question answers as the proposal's ROI spine, address the pre-close objection head-on in the proposal.`;

const RULES = `HARD RULES:
- Every claim about the prospect must come from real research or the cold-call notes below. If unverified, write "(confirm on call)" — never invent facts.
- Be specific: name the branch, the review count, the website builder, the content pattern. Generic filler kills credibility.
- Research: locations/branches/group structure, services and likely ticket sizes, finance offers/promos, who built their website, Google review count/rating, social posting style (static vs video, product vs people), and check the Meta Ad Library (facebook.com/ads/library) for active ads. Find at least ONE specific observable marketing gap.
- Never position against their existing website/SEO provider — LS Growth is the booked-jobs side that runs alongside.
- Never use "AI", "automation", or "system" as selling points.
- Never name a price. Price lives in the proposal on call #2.
- Output only the completed call sheet in the template structure below, in markdown. No preamble.`;

export function callPrepPrompt(s: CallPrepSheet): string {
  return `You are the call-prep researcher for LS Growth, a NZ lead generation agency run by Lucky. LS Growth runs Meta ads for trade and cleaning businesses in NZ and Australia and delivers BOOKED APPOINTMENTS, not raw leads: ads capture the lead, LS Growth's own follow-up software contacts every lead within ~5 minutes, and Lucky personally qualifies each one by phone before it hits the client's calendar. Core offer: 10+ qualified quote requests in the first 3 weeks or you don't pay.

PROSPECT: ${s.business_name} · ${s.website} · Contact: ${s.contact_name || "(confirm on call)"}${s.contact_role ? `, ${s.contact_role}` : ""} · Call: ${s.call_datetime || "(confirm on call)"} · Niche: ${s.niche || "(confirm on call)"}
COLD-CALL NOTES (weight these heavily): ${s.cold_call_notes || "none"}

${RULES}

TEMPLATE TO FILL:
${TEMPLATE}`;
}
