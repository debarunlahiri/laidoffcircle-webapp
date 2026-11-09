"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  readJson,
  setVerificationBlocked,
  statusMessage,
} from "@/lib/api";
import { cacheClear } from "@/lib/cache";
import { googleIdToken } from "@/lib/firebase";
export type AuthUser = {
  id: string;
  name: string;
  username?: string;
  email: string;
  role?: string;
  about?: string;
  skills?: string[];
  nextChapter?: string;
  openToWork?: boolean;
  location?: string;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  badge?: "blue" | "gold" | null;
  googleLinked?: boolean;
  // false until the member confirms the link we email them.
  emailVerified?: boolean;
  // Only ever true for administrators; used to show the Admin link.
  isAdmin?: boolean;
  // True while the member still has to verify their email (never for admins).
  verificationRequired?: boolean;
  // Unverified members can browse read-only until this time (ISO), then are locked out.
  emailVerificationDeadline?: string | null;
  verificationExpired?: boolean;
};
export type ProfilePatch = Partial<
  Pick<
    AuthUser,
    | "name"
    | "username"
    | "role"
    | "about"
    | "skills"
    | "nextChapter"
    | "openToWork"
    | "location"
  >
>;
type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  sessionError: string;
  refreshSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  loginGoogle: () => Promise<void>;
  linkGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<void>;
  // Local-only update after the server already saved (e.g. new photo URLs).
  applyProfile: (patch: Partial<AuthUser>) => void;
};
const Context = createContext<AuthState | null>(null);
async function authRequest(action: string, body?: unknown) {
  const response = await fetch(`/api/auth/${action}`, {
    method: action === "session" ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const { data = null } = await readJson(response);
  if (!response.ok)
    throw Object.assign(
      new Error(
        data?.error?.message ??
          (response.status >= 500
            ? statusMessage(response.status)
            : "Unable to sign in. Please try again."),
      ),
      { status: response.status },
    );
  return data;
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const epoch = useRef(0);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const refreshSession = useCallback(async () => {
    const generation = epoch.current;
    setLoading(true);
    setSessionError("");
    try {
      // Retry transient failures (server restarting, brief network loss)
      // before bothering the user with an error screen.
      for (let attempt = 0; ; attempt++) {
        try {
          const current = await authRequest("session");
          if (generation === epoch.current) setUser(current);
          return;
        } catch (error) {
          if (generation !== epoch.current) return;
          if ((error as { status?: number }).status === 401) {
            setUser(null);
            return;
          }
          if (attempt >= 3) {
            setSessionError(
              "We couldn’t restore your session. Please try again.",
            );
            return;
          }
          await new Promise((resolve) =>
            setTimeout(resolve, 700 * 2 ** attempt),
          );
          if (generation !== epoch.current) return;
        }
      }
    } finally {
      if (generation === epoch.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);
  // Cached data and the "must verify" flag belong to whoever is signed in.
  useEffect(() => {
    cacheClear();
  }, [user?.id]);
  useEffect(() => {
    setVerificationBlocked(Boolean(user?.verificationRequired));
  }, [user?.verificationRequired]);
  // The server says verification is needed (e.g. the preview window just ended).
  useEffect(() => {
    const update = () => void refreshSession();
    window.addEventListener("auth:unverified", update);
    return () => window.removeEventListener("auth:unverified", update);
  }, [refreshSession]);
  useEffect(() => {
    const update = () => {
      if (document.visibilityState === "visible") void refreshSession();
    };
    document.addEventListener("visibilitychange", update);
    window.addEventListener("auth:expired", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("auth:expired", update);
    };
  }, [refreshSession]);
  async function complete(action: string, body: unknown) {
    epoch.current++;
    setLoading(false);
    const result = await authRequest(action, body);
    setUser(
      action === "google"
        ? { ...result.user, googleLinked: true }
        : result.user,
    );
    setSessionError("");
  }
  return (
    <Context.Provider
      value={{
        user,
        loading,
        sessionError,
        refreshSession,
        login: (email, password) => complete("login", { email, password }),
        register: (name, username, email, password) =>
          complete("register", { name, username, email, password }),
        loginGoogle: async () =>
          complete("google", { idToken: await googleIdToken() }),
        linkGoogle: async () => {
          await authRequest("link-google", { idToken: await googleIdToken() });
          setUser((current) =>
            current ? { ...current, googleLinked: true } : current,
          );
        },
        resendVerification: async () => {
          await authRequest("resend-verification");
        },
        updateProfile: async (patch) => {
          await api("/me", { method: "PATCH", body: patch });
          setUser((current) => (current ? { ...current, ...patch } : current));
        },
        applyProfile: (patch) =>
          setUser((current) => (current ? { ...current, ...patch } : current)),
        logout: async () => {
          epoch.current++;
          await authRequest("logout");
          setLoading(false);
          setUser(null);
          setSessionError("");
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const context = useContext(Context);
  if (!context) throw new Error("AuthProvider missing");
  return context;
}
export function userInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
