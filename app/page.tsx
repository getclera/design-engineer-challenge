import { orgRoutes } from "@clera/route-factory";
import { redirect } from "next/navigation";
import { ORG_ID } from "@mock/ids";

export default function Home() {
  redirect(orgRoutes.review(ORG_ID));
}
