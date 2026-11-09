import AuthGuard from "@/components/auth/auth-guard";
import AppShell from "@/components/layout/app-shell";
import { ConfirmProvider } from "@/providers/confirm-provider";
import { PlatformProvider } from "@/providers/platform-provider";
import type { ReactNode } from "react";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ConfirmProvider>
        <PlatformProvider>
          <AppShell>{children}</AppShell>
        </PlatformProvider>
      </ConfirmProvider>
    </AuthGuard>
  );
}
