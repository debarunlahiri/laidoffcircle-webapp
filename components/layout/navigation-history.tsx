"use client";

import { useEffect } from "react";

const stackKey = "laidoffcircleStackDepth";

export function appStackDepth(): number {
  const depth = window.history.state?.[stackKey];
  return Number.isInteger(depth) && depth >= 0 ? depth : 0;
}

// Mark only entries created inside this app. Browser history length can include
// other websites, so it cannot tell us whether an in-app back action is safe.
export default function NavigationHistory() {
  useEffect(() => {
    const history = window.history;
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;

    originalReplace.call(
      history,
      { ...history.state, [stackKey]: appStackDepth() },
      "",
    );

    const push: History["pushState"] = function (
      this: History,
      data,
      unused,
      url,
    ) {
      originalPush.call(
        this,
        { ...data, [stackKey]: appStackDepth() + 1 },
        unused,
        url,
      );
    };
    const replace: History["replaceState"] = function (
      this: History,
      data,
      unused,
      url,
    ) {
      originalReplace.call(
        this,
        { ...data, [stackKey]: appStackDepth() },
        unused,
        url,
      );
    };

    history.pushState = push;
    history.replaceState = replace;
    return () => {
      if (history.pushState === push) history.pushState = originalPush;
      if (history.replaceState === replace)
        history.replaceState = originalReplace;
    };
  }, []);

  return null;
}
