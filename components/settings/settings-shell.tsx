import type { ReactNode } from "react";

export default function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <div className="settings-page">
      <section className="settings-panel">{children}</section>
    </div>
  );
}
