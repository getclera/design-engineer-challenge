export const PASS_CATEGORIES = [
  { id: "too_senior", label: "Too senior" },
  { id: "too_junior", label: "Too junior" },
  { id: "missing_skills", label: "Missing skills" },
  { id: "wrong_background", label: "Wrong background" },
  { id: "salary_expectations", label: "Comp too high" },
  { id: "location_mismatch", label: "Location / remote" },
  { id: "visa", label: "Visa / work permit" },
  { id: "already_in_pipeline", label: "Already in pipeline" },
] as const;

export const INTRO_CATEGORIES = [
  { id: "strong_stack_match", label: "Strong stack match" },
  { id: "great_trajectory", label: "Great trajectory" },
  { id: "domain_fit", label: "Domain fit" },
  { id: "founder_energy", label: "Founder energy" },
] as const;

export const STREAM_LABELS = {
  interest: "Expressed interest",
  curated: "We think it's a match",
  drop: "Outstanding this week",
} as const;

export type Stream = keyof typeof STREAM_LABELS;

export function streamOf(bucket: string): Stream {
  if (bucket === "intro_request") return "interest";
  if (bucket === "role_specific") return "curated";
  return "drop";
}

export function reviewItemKey({ talentId, roleId }: { talentId: string; roleId: string | null }): string {
  return `${talentId}:${roleId ?? "__general__"}`;
}
