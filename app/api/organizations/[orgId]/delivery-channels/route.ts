import { error, json, latency, requireUser } from "@mock/http";
import { DELIVERY } from "@mock/org";
import { CHANNELS, DELIVERY_KINDS, type Delivery, FREQUENCIES } from "@v2/features/org-settings/delivery";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json(DELIVERY);
}

/** Tick or untick a box, change how often, or change the email list. Company-wide: owners only. */
export async function PUT(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't change where candidates go", 403);
  const body = (await request.json()) as Partial<Delivery>;
  const next: Partial<Delivery> = {};
  if (body.grid !== undefined) {
    const grid = structuredClone(DELIVERY.grid);
    for (const [kind, row] of Object.entries(body.grid)) {
      if (!DELIVERY_KINDS.some((k) => k.key === kind)) return error(`Unknown update ${kind}`, 400);
      for (const [channel, on] of Object.entries(row ?? {})) {
        if (!(CHANNELS as readonly string[]).includes(channel) || typeof on !== "boolean")
          return error(`Unknown channel ${channel}`, 400);
        grid[kind as keyof Delivery["grid"]][channel as (typeof CHANNELS)[number]] = on;
      }
    }
    next.grid = grid;
  }
  if (body.frequency !== undefined) {
    if (!FREQUENCIES.some((f) => f.key === body.frequency)) return error("Pick right away, daily or weekly", 400);
    next.frequency = body.frequency;
  }
  if (body.emails !== undefined) {
    if (!Array.isArray(body.emails) || !body.emails.every((e) => typeof e === "string" && EMAIL.test(e)))
      return error("That doesn't look like an email address", 400);
    next.emails = [...new Set(body.emails.map((e) => e.trim().toLowerCase()))];
  }
  await latency(150, 400);
  Object.assign(DELIVERY, next);
  return json(DELIVERY);
}

/** "Use a different email address". */
export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't change where candidates go", 403);
  const { channelIdentifier } = (await request.json()) as { channelIdentifier?: string };
  const email = channelIdentifier?.trim().toLowerCase() ?? "";
  if (!EMAIL.test(email)) return error("That doesn't look like an email address", 400);
  if (DELIVERY.emails.includes(email)) return error("Already on the list", 409);
  await latency(200, 500);
  DELIVERY.emails.push(email);
  return json(DELIVERY);
}
