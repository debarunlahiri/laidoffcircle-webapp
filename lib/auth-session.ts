import { NextRequest, NextResponse } from "next/server";

const cookieName = "laidoff_session";
const backendOrigin = () =>
  (process.env.BACKEND_API_URL ?? "http://127.0.0.1:9090/api/v1").replace(
    /\/$/,
    "",
  );
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
const jsonError = (message: string, status: number) =>
  NextResponse.json(
    { error: { message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
function clearSession(response: NextResponse) {
  response.cookies.set(cookieName, "", { ...cookieOptions, maxAge: 0 });
  return response;
}

export async function handleAuthRequest(request: NextRequest, action: string) {
  if (
    ![
      "login",
      "register",
      "google",
      "link-google",
      "logout",
      "session",
      "verify-email",
      "resend-verification",
    ].includes(action)
  )
    return jsonError("Not found", 404);
  const isSession = action === "session";
  if (
    (isSession && request.method !== "GET") ||
    (!isSession && request.method !== "POST")
  )
    return jsonError("Method not allowed", 405);
  const expectedOrigin =
    process.env.AUTH_APP_ORIGIN ??
    `${request.nextUrl.protocol}//${request.headers.get("host") ?? request.nextUrl.host}`;
  if (!isSession && request.headers.get("origin") !== expectedOrigin)
    return jsonError("Request origin not allowed", 403);
  const token = request.cookies.get(cookieName)?.value;
  if (
    ["session", "logout", "link-google", "resend-verification"].includes(
      action,
    ) &&
    !token
  ) {
    if (action === "logout")
      return clearSession(new NextResponse(null, { status: 204 }));
    return jsonError("Please sign in", 401);
  }
  let body;
  if (!isSession && !["logout", "resend-verification"].includes(action)) {
    const reader = request.body?.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 32000) {
          await reader.cancel();
          return jsonError("Request too large", 413);
        }
        chunks.push(value);
      }
    }
    const raw = Buffer.concat(chunks).toString("utf8");
    try {
      body = JSON.parse(raw);
    } catch {
      return jsonError("Invalid request", 400);
    }
  }
  try {
    const endpoint = isSession
      ? "me"
      : action === "link-google"
        ? "google/link"
        : action;
    const upstream = await fetch(`${backendOrigin()}/auth/${endpoint}`, {
      method: isSession ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(request.headers.get("user-agent")
          ? { "User-Agent": request.headers.get("user-agent")! }
          : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (action === "logout")
      return clearSession(new NextResponse(null, { status: 204 }));
    const payload = await upstream.json().catch(() => null);
    if (payload === null)
      return NextResponse.json(
        {
          error: {
            code: "BAD_GATEWAY",
            message:
              "Our servers are having trouble right now. Please try again in a moment.",
          },
        },
        { status: upstream.ok ? 502 : upstream.status },
      );
    if (!upstream.ok) {
      const response = NextResponse.json(payload, { status: upstream.status });
      return isSession && upstream.status === 401
        ? clearSession(response)
        : response;
    }
    if (
      isSession ||
      ["link-google", "verify-email", "resend-verification"].includes(action)
    )
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store" },
      });
    if (
      typeof payload.token !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(payload.token) ||
      !payload.user ||
      !Number.isFinite(Date.parse(payload.expiresAt))
    )
      return jsonError("Unexpected authentication response", 502);
    const response = NextResponse.json(
      { user: payload.user },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(cookieName, payload.token, {
      ...cookieOptions,
      expires: new Date(payload.expiresAt),
    });
    return response;
  } catch {
    if (action === "logout")
      return clearSession(new NextResponse(null, { status: 204 }));
    return jsonError("We couldn’t reach the server. Please try again.", 503);
  }
}
