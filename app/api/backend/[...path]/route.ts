import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/backend-proxy";
export const runtime = "nodejs";
async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyBackend(request, (await context.params).path);
}
export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
