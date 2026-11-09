import { NextRequest } from "next/server";
import { handleAuthRequest } from "@/lib/auth-session";
export const runtime = "nodejs";
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  return handleAuthRequest(request, (await context.params).action);
}
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  return handleAuthRequest(request, (await context.params).action);
}
