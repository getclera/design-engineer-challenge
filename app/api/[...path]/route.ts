import { NextResponse } from "next/server";

function notMocked(request: Request) {
  console.warn(`[mock-api] no mock for ${request.method} ${new URL(request.url).pathname}`);
  return NextResponse.json({ error: "Not available in the challenge" }, { status: 404 });
}

export { notMocked as GET, notMocked as POST, notMocked as PATCH, notMocked as PUT, notMocked as DELETE };
