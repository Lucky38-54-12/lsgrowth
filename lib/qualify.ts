import { QualificationScore } from "./types";
import { LOCATIONS } from "./parseLead";

const NICHE_FIT_PATTERN = /clean|trade|construct|electric|spark|outdoor|landscap|plumb/i;

export function isNzOrAu(location: string): boolean {
  if (!location) return false;
  if (/\bNZ\b|New Zealand|\bAU\b|Australia/i.test(location)) return true;
  return LOCATIONS.some(city => new RegExp(`\\b${city}\\b`, "i").test(location));
}

export interface QualifyInput {
  employee_count: number | null;
  trade: string;
  location: string;
}

export interface QualifyResult {
  score: QualificationScore;
  reason: string;
}

// Team size is the hard gate — one-man bands get disqualified regardless of
// niche/location fit, since they can't handle the lead volume LS Growth generates.
export function scoreProspect(input: QualifyInput): QualifyResult {
  const { employee_count, trade, location } = input;
  const nicheFit = NICHE_FIT_PATTERN.test(trade || "");
  const locationFit = isNzOrAu(location || "");

  if (employee_count === 1) {
    return { score: "disqualify", reason: "One-man band (1 employee) — can't handle lead volume." };
  }
  if (employee_count === null || employee_count === undefined) {
    return { score: "maybe", reason: "Team size unknown — confirm before calling." };
  }
  if (employee_count >= 5 && nicheFit && locationFit) {
    return { score: "strong", reason: `${employee_count} employees, niche fit, ${locationFit ? "NZ/AU" : "location unconfirmed"}.` };
  }
  if (employee_count >= 5) {
    return { score: "maybe", reason: `${employee_count} employees but ${!nicheFit ? "niche doesn't clearly fit" : "location isn't NZ/AU"}.` };
  }
  return { score: "maybe", reason: `${employee_count} employees — smaller team, worth a call but not a priority.` };
}
