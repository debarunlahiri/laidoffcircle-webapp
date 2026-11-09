import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/backend-proxy";
export const runtime = "nodejs";
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> },
) {
  return proxyBackend(request, [(await context.params).filename], true);
}
