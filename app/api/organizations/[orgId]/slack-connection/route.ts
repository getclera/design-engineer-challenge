import { error, json, latency, requireUser } from "@mock/http";
import { DELIVERY } from "@mock/org";

const state = () => ({ connected: !!DELIVERY.slackChannel, channelName: DELIVERY.slackChannel });

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json(state());
}

/**
 * "Connect Slack". The real one goes through Slack's sign-in; here it connects #hiring at once (assumed data).
 * New candidates start going there, since that's why people connect it.
 */
export async function POST() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't connect Slack", 403);
  await latency(600, 1000);
  DELIVERY.slackChannel = "#hiring";
  DELIVERY.grid.submissions.slack = true;
  return json(state());
}
