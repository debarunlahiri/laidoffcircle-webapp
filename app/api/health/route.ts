export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lets the sign-in pages tell "your internet is down" apart from
// "our server is down": the browser reaches this route, this route reaches the API.
export async function GET() {
  const base = process.env.BACKEND_API_URL ?? "http://127.0.0.1:9090/api/v1";
  try {
    const response = await fetch(`${new URL(base).origin}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    return Response.json(
      { backend: response.ok },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { backend: false },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
