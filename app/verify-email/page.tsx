import { Suspense } from "react";
import VerifyEmail from "@/components/auth/verify-email";
export const metadata = { title: "Verify your email — LaidOffCircle" };
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="auth-loading">Loading…</div>}>
      <VerifyEmail />
    </Suspense>
  );
}
