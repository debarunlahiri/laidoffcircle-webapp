"use client";
import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
const key = "laidoffcircle:theme";

// Reads the theme the inline script already applied, and lets the user flip it.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    setTheme(
      document.documentElement.dataset.theme === "dark" ? "dark" : "light",
    );
  }, []);
  const toggle = useCallback(() => {
    const next: Theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.dataset.theme = next;
    window.setTimeout(() => root.classList.remove("theme-switching"), 350);
    setTheme(next);
    try {
      localStorage.setItem(key, next);
    } catch {}
  }, []);
  return { theme, toggle };
}
