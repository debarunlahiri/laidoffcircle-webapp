"use client";
import { cacheInvalidate } from "./cache";
import {
  checkConnection,
  connectionMessages,
  reportConnectionFailure,
} from "./connection";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}
// Set by the auth provider while the signed-in member must still verify their email.
let verificationBlocked = false;
export function setVerificationBlocked(value: boolean) {
  verificationBlocked = value;
}
const unverifiedMessage =
  "Please verify your email before you do this. We’ve sent you a link.";
function announceUnverified(code: string) {
  window.dispatchEvent(new CustomEvent("auth:unverified", { detail: code }));
}

// The server normally answers JSON, but a proxy, gateway or crashed server can
// answer with an HTML error page. Never let that surface as a JSON parse error.
export function statusMessage(status: number) {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don’t have permission to do that.";
  if (status === 404) return "We couldn’t find what you were looking for.";
  if (status === 413) return "That file or message is too large.";
  if (status === 429)
    return "Too many requests. Please wait a moment and try again.";
  if (status >= 500)
    return "Our servers are having trouble right now. Please try again in a moment.";
  return "The request failed. Please try again.";
}
export async function readJson(
  response: Response,
): Promise<{ data: any; valid: boolean }> {
  if (response.status === 204) return { data: undefined, valid: true };
  const text = await response.text();
  if (!text) return { data: undefined, valid: true };
  try {
    return { data: JSON.parse(text), valid: true };
  } catch {
    return { data: undefined, valid: false };
  }
}

type Options = { method?: string; body?: unknown; signal?: AbortSignal };
async function request<T>(path: string, options: Options): Promise<T> {
  const form = options.body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`/api/backend${path}`, {
      method: options.method ?? "GET",
      headers: form ? undefined : { "Content-Type": "application/json" },
      body:
        options.body === undefined
          ? undefined
          : form
            ? (options.body as FormData)
            : JSON.stringify(options.body),
      signal: options.signal,
      cache: "no-store",
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    reportConnectionFailure();
    throw new ApiError(
      navigator.onLine
        ? connectionMessages["server-down"]
        : connectionMessages.offline,
      0,
      "NETWORK",
    );
  }
  const { data, valid } = await readJson(response);
  if (!valid) {
    if (response.status >= 500 || response.ok) reportConnectionFailure();
    throw new ApiError(
      response.ok
        ? connectionMessages["server-down"]
        : statusMessage(response.status),
      response.status,
      "BAD_RESPONSE",
    );
  }
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event("auth:expired"));
      if (options.method && options.method !== "GET") requireSignIn();
    }
    const code: string | undefined = data?.error?.code;
    if (code === "EMAIL_NOT_VERIFIED" || code === "EMAIL_VERIFICATION_REQUIRED")
      announceUnverified(code);
    throw new ApiError(
      data?.error?.message ?? statusMessage(response.status),
      response.status,
      code,
    );
  }
  return data as T;
}
// Identical GETs that are in flight at the same time share one network call.
const inflight = new Map<string, Promise<unknown>>();
export async function api<T = void>(
  path: string,
  options: Options = {},
): Promise<T> {
  const method = options.method ?? "GET";
  if (method !== "GET") {
    // Support stays available for verification issues. Other changes require
    // verification; confirm the connection before sending either kind.
    if (verificationBlocked && !/^\/support(?:\/|\?|$)/.test(path)) {
      announceUnverified("EMAIL_NOT_VERIFIED");
      throw new ApiError(unverifiedMessage, 403, "EMAIL_NOT_VERIFIED");
    }
    const state = await checkConnection();
    if (state !== "online")
      throw new ApiError(
        connectionMessages[state],
        0,
        state === "offline" ? "OFFLINE" : "SERVER_DOWN",
      );
    return request<T>(path, options);
  }
  if (options.signal) return request<T>(path, options);
  const running = inflight.get(path) as Promise<T> | undefined;
  if (running) return running;
  const promise = request<T>(path, options).finally(() =>
    inflight.delete(path),
  );
  inflight.set(path, promise);
  return promise;
}
export function requireSignIn() {
  window.dispatchEvent(new Event("auth:required"));
}
export function invalidate(...roots: string[]) {
  cacheInvalidate(roots);
  window.dispatchEvent(new CustomEvent("api:changed", { detail: roots }));
}
export const apiMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
export function queryPath(
  path: string,
  values: Record<string, string | number | undefined>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    if (value !== undefined && value !== "") query.set(key, String(value));
  return `${path}${query.size ? `?${query}` : ""}`;
}
export function utcDate(value: string) {
  return new Date(
    /[zZ]$|[+-]\d{2}:\d{2}$/.test(value)
      ? value
      : `${value.replace(" ", "T")}Z`,
  );
}
export function displayTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(utcDate(value));
}
export function displayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(utcDate(value));
}
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
export function mediaUrl(path: string | null | undefined) {
  return path
    ? `/api/media/${encodeURIComponent(path.split("/").pop()!)}`
    : undefined;
}
