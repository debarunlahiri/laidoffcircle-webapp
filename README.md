# LaidOffCircle webapp

Mobile web app for LaidOffCircle. It shares its data layer with `laidoff-web` (same backend proxy and hooks).

## Background refresh and data usage

Live updates arrive over a WebSocket; polling is only a slow fallback and pauses while the tab is hidden. Intervals: connection check 60 s, notifications 90 s, messages 60–90 s, connections 2 min, people/trending/referrals 3 min, support 1–2 min. Change them in the `hooks/` files or the component that calls `useApiResource` / `useApiList`. The full table is in the `laidoff-web` README.
