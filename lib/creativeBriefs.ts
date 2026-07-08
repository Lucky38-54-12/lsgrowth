// Per-niche creative ask for the onboarding email — what to actually tell a
// new client to film/send. Edit freely as you learn what converts best.
export const CREATIVE_BRIEFS: Record<string, string> = {
  Cleaning:
    "3rd-person POV clean footage: someone filming the cleaner working, before/after shots of the space, 20–30 seconds phone-shot is perfect. No need for anything polished — raw and real outperforms produced content.",
  "Trades/Construction":
    "On-site job footage: a 20–30 second phone clip of the crew mid-job (install, fix, pour — whatever's typical), plus a couple of finished-job photos. Show the team, not just the work.",
  "Outdoor Living":
    "Before/after shots of a recent build or install, plus a short walkthrough clip once it's finished — someone talking through what was done, 30 seconds is plenty.",
  Electrical:
    "Quick phone clip of a job in progress (switchboard, install, callout van pulling up) plus 2–3 finished-job photos. Anything showing the team/van builds trust fast.",
  Other:
    "A short phone-shot clip (20–30 seconds) of the work in progress, plus a couple of before/after or finished-result photos. Real footage of real people beats stock or studio shots every time.",
};

export function creativeBriefFor(niche: string | null | undefined): string {
  return CREATIVE_BRIEFS[niche || ""] || CREATIVE_BRIEFS.Other;
}
