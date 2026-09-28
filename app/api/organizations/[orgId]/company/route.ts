import { error, json, latency, requireUser } from "@mock/http";
import { COMPANY_PROFILE, ORGANIZATION } from "@mock/org";
import {
  COMPANY_SIZES,
  COMPANY_STAGES,
  type CompanyProfile,
  IMAGE_FIELDS,
  looksLikeUrl,
  PITCH_MAX,
  TAG_FIELDS,
  URL_FIELDS,
  WORK_MODES,
} from "@v2/features/org-settings/company-profile";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json(COMPANY_PROFILE);
}

const TEXT_FIELDS = ["name", "pitch", "building", "team", "industry", "funding", "founded", ...URL_FIELDS] as const;
const MAX_IMAGES = 8;
// Uploads are kept in memory as data URLs (no storage in this mock), scaled down by the browser first.
const MAX_IMAGE_CHARS = 1_500_000;
const isImage = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length <= MAX_IMAGE_CHARS &&
  (/^data:image\/(png|jpeg|webp|gif|svg\+xml);base64,/.test(value) || /^\/(logos|images)\//.test(value));
const CHOICES = { size: COMPANY_SIZES, stage: COMPANY_STAGES, mode: WORK_MODES } as const;

/** Settings autosaves one field at a time; anything else in the body is refused. */
export async function PATCH(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't change the company profile", 403);
  const body = (await request.json()) as Record<string, unknown>;
  const next: Partial<CompanyProfile> = {};

  for (const [key, value] of Object.entries(body)) {
    if ((TEXT_FIELDS as readonly string[]).includes(key)) {
      if (typeof value !== "string") return error(`${key} must be text`, 400);
      const text = value.trim();
      if (key === "name" && !text) return error("The company needs a name", 400);
      if (key === "pitch" && text.length > PITCH_MAX) return error(`Keep the pitch under ${PITCH_MAX} characters`, 400);
      if (key === "founded" && text && !/^(19|20)\d{2}$/.test(text)) return error("Founded should be a year, like 2021", 400);
      if ((URL_FIELDS as readonly string[]).includes(key) && text && !looksLikeUrl(text))
        return error("That doesn't look like a link", 400);
      Object.assign(next, { [key]: text });
    } else if (key in CHOICES) {
      const options = CHOICES[key as keyof typeof CHOICES] as readonly string[];
      if (value !== null && !options.includes(value as string)) return error(`Unknown ${key}`, 400);
      Object.assign(next, { [key]: value });
    } else if (key === "reasons") {
      if (!Array.isArray(value) || value.length !== 3 || value.some((r) => typeof r !== "string"))
        return error("Send exactly 3 reasons", 400);
      next.reasons = value.map((r: string) => r.trim()) as CompanyProfile["reasons"];
    } else if (key === "logo") {
      if (!isImage(value)) return error("Use a PNG, JPG or WebP under 1 MB", 400);
      next.logo = value;
    } else if ((IMAGE_FIELDS as readonly string[]).includes(key)) {
      if (!Array.isArray(value) || !value.every(isImage)) return error("Use PNG, JPG or WebP images under 1 MB", 400);
      if (value.length > MAX_IMAGES) return error(`Up to ${MAX_IMAGES} images`, 400);
      Object.assign(next, { [key]: value });
    } else if ((TAG_FIELDS as readonly string[]).includes(key)) {
      if (!Array.isArray(value) || value.some((t) => typeof t !== "string")) return error(`${key} must be a list`, 400);
      Object.assign(next, { [key]: [...new Set(value.map((t: string) => t.trim()).filter(Boolean))].slice(0, 20) });
    } else return error(`Can't change ${key}`, 400);
  }

  await latency(150, 400);
  Object.assign(COMPANY_PROFILE, next);
  // The sidebar and org switcher read the name from here.
  if (next.name) ORGANIZATION.name = next.name;
  return json(COMPANY_PROFILE);
}
