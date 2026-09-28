import { error, json, latency, requireUser } from "@mock/http";
import { COMPANY_PROFILE, WEBSITE_FINDINGS } from "@mock/org";
import { type CompanyProfile, fillEmpty, looksLikeUrl } from "@v2/features/org-settings/company-profile";

/**
 * "Fill from website": read the company's site and answer the fields that are still empty. Never overwrites.
 * Returns what it changed and what was there before, so each field can be undone on its own.
 */
export async function POST() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't change the company profile", 403);
  if (!looksLikeUrl(COMPANY_PROFILE.website)) return error("Add your website first", 400);
  await latency(900, 1400);
  const filled = fillEmpty(COMPANY_PROFILE, WEBSITE_FINDINGS);
  const previous = Object.fromEntries(
    Object.keys(filled).map((key) => [key, structuredClone(COMPANY_PROFILE[key as keyof CompanyProfile])]),
  );
  Object.assign(COMPANY_PROFILE, filled);
  return json({ profile: COMPANY_PROFILE, filled: Object.keys(filled), previous });
}
