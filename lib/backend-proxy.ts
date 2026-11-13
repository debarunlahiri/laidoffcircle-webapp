import { NextRequest, NextResponse } from "next/server";
const roots = new Set([
  "users",
  "me",
  "companies",
  "posts",
  "connections",
  "referrals",
  "conversations",
  "insights",
  "notifications",
  "uploads",
  "network",
  "daily-reminder",
  "search",
  "ws-ticket",
  "admin",
  "support",
]);
const backendBase = () =>
  (process.env.BACKEND_API_URL ?? "http://127.0.0.1:9090/api/v1").replace(
    /\/$/,
    "",
  );
const errorResponse = (message: string, status: number) =>
  NextResponse.json(
    { error: { message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
async function proxyBackendInner(
  request: NextRequest,
  segments: string[],
  media = false,
) {
  const token = request.cookies.get("laidoff_session")?.value;
  const publicRead =
    request.method === "GET" &&
    (media ||
      /^(daily-reminder|search|posts(?:\/topics|\/topic-options|\/[0-9a-f-]{36}|\/[a-zA-Z0-9-]+\/comments)?|referrals|companies(?:\/[a-zA-Z0-9-]+)?|users(?:\/[a-zA-Z0-9_-]+(?:\/stats)?)?|insights(?:\/[-a-zA-Z0-9_]+)*)$/.test(
        segments.join("/"),
      ));
  if (!token && !publicRead) return errorResponse("Please sign in", 401);
  if (
    media
      ? !/^[0-9a-f-]{36}\.webp$/.test(segments[0] ?? "")
      : !roots.has(segments[0]) ||
        segments.some((part) => !/^[-a-zA-Z0-9_]+$/.test(part))
  )
    return errorResponse("Not found", 404);
  const mutation = !["GET", "HEAD"].includes(request.method);
  const origin =
    process.env.AUTH_APP_ORIGIN ??
    `${request.nextUrl.protocol}//${request.headers.get("host") ?? request.nextUrl.host}`;
  if (mutation && request.headers.get("origin") !== origin)
    return errorResponse("Request origin not allowed", 403);
  try {
    const base = backendBase();
    const url = media
      ? `${base.replace(/\/api\/v1$/, "")}/uploads/${segments[0]}`
      : `${base}/${segments.join("/")}${request.nextUrl.search}`;
    const headers = new Headers(
      token ? { Authorization: `Bearer ${token}` } : {},
    );
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    const agent = request.headers.get("user-agent");
    if (agent) headers.set("User-Agent", agent);
    // Allow multipart overhead for private chat and support attachments.
    const maxBody =
      segments[0] === "support" ||
      (segments[0] === "admin" && segments[1] === "support")
        ? 27 * 1024 * 1024
        : segments[0] === "conversations"
          ? 17 * 1024 * 1024
          : 6 * 1024 * 1024;
    let body: Uint8Array | undefined;
    if (mutation) {
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let length = 0;
      if (reader)
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          length += value.byteLength;
          if (length > maxBody) {
            await reader.cancel();
            return errorResponse("Request too large", 413);
          }
          chunks.push(value);
        }
      body = Buffer.concat(chunks);
    }
    const upstream = await fetch(url, {
      method: request.method,
      headers,
      body: body as BodyInit | undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(
        segments[0] === "support" ||
          (segments[0] === "admin" && segments[1] === "support")
          ? 60000
          : 20000,
      ),
    });
    const responseHeaders = new Headers({ "Cache-Control": "no-store" });
    for (const name of [
      "content-type",
      "content-disposition",
      "x-request-id",
      "retry-after",
    ]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new NextResponse(upstream.status === 204 ? null : upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[proxy] upstream request failed", error);
    return errorResponse("The server is unavailable. Please try again.", 503);
  }
}

// ---- Console logging of each proxied exchange (headers, bodies) ----
// On by default outside production; HTTP_LOG_DETAIL=true|false overrides.
const detailed =
  process.env.HTTP_LOG_DETAIL !== undefined
    ? process.env.HTTP_LOG_DETAIL !== "false"
    : process.env.NODE_ENV !== "production";
const sensitiveHeader =
  /^(authorization|cookie|set-cookie|x-api-key|proxy-authorization)$/i;
const sensitiveKey =
  /pass(word)?|token|secret|authorization|api[-_]?key|credential|cookie/i;
const clip = (text: string, max = 800) =>
  text.length > max
    ? `${text.slice(0, max)}… (+${text.length - max} chars)`
    : text;
const headersOf = (headers: Headers) =>
  Object.fromEntries(
    [...headers.entries()].map(([name, value]) => [
      name,
      sensitiveHeader.test(name) ? "[REDACTED]" : value,
    ]),
  );
function scrub(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[…]";
  if (Array.isArray(value))
    return value.slice(0, 20).map((v) => scrub(v, depth + 1));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        sensitiveKey.test(k) ? "[REDACTED]" : scrub(v, depth + 1),
      ]),
    );
  return value;
}
async function jsonBody(source: Request | Response) {
  const type = source.headers.get("content-type") ?? "";
  if (!type.includes("json")) return null;
  try {
    const text = await source.clone().text();
    if (!text) return null;
    try {
      return clip(JSON.stringify(scrub(JSON.parse(text))));
    } catch {
      return clip(text);
    }
  } catch {
    return null;
  }
}
const quietRoute = (segments: string[], media: boolean) => media;

export async function proxyBackend(
  request: NextRequest,
  segments: string[],
  media = false,
) {
  const started = performance.now();
  const label = `${request.method} /${media ? "media" : "backend"}/${segments.join("/")}${request.nextUrl.search}`;
  // The inner call consumes the request body, so read a copy first.
  const requestBody =
    detailed && !quietRoute(segments, media) && request.method !== "GET"
      ? await jsonBody(request)
      : null;
  try {
    const response = await proxyBackendInner(request, segments, media);
    const ms = Math.round(performance.now() - started);
    if (!detailed || quietRoute(segments, media)) {
      console.log(`[proxy] ${label} -> ${response.status} (${ms}ms)`);
      return response;
    }
    const responseBody = await jsonBody(response);
    const lines = [
      `[proxy] ${label} -> ${response.status} (${ms}ms)`,
      `  ▶ request headers  ${clip(JSON.stringify(headersOf(request.headers)), 1200)}`,
    ];
    if (requestBody) lines.push(`  ▶ request body     ${requestBody}`);
    lines.push(
      `  ◀ response headers ${clip(JSON.stringify(headersOf(response.headers)), 1200)}`,
    );
    if (responseBody) lines.push(`  ◀ response body    ${responseBody}`);
    console.log(lines.join("\n"));
    return response;
  } catch (error) {
    console.error(`[proxy] ${label} -> threw`, error);
    throw error;
  }
}
