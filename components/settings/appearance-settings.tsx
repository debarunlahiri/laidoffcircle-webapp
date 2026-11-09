"use client";

import { SettingsGroup, SettingsRow } from "@/components/settings/settings-row";
import { Palette } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function AppearanceSettings() {
  const { theme, toggle } = useTheme();
  return (
    <div className="settings-stack">
      <header className="settings-page-heading">
        <p>Choose how LaidOffCircle looks on this device.</p>
      </header>
      <SettingsGroup
        icon={Palette}
        title="Theme"
        description="A comfortable view, day or night."
      >
        <SettingsRow label="Dark mode" hint="Easier on the eyes in low light.">
          <button
            type="button"
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Dark mode"
            className={`theme-switch ${theme === "dark" ? "on" : ""}`}
            onClick={toggle}
          />
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}
