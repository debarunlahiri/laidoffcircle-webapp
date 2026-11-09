"use client";
import { useState } from "react";

export function useInterface() {
  const [headerMenu, setHeaderMenu] = useState<
    "notifications" | "account" | null
  >(null);

  function setNotifications(open: boolean) {
    setHeaderMenu((current) =>
      open ? "notifications" : current === "notifications" ? null : current,
    );
  }

  function setAccountOpen(open: boolean) {
    setHeaderMenu((current) =>
      open ? "account" : current === "account" ? null : current,
    );
  }

  return {
    notifications: headerMenu === "notifications",
    accountOpen: headerMenu === "account",
    setNotifications,
    setAccountOpen,
  };
}
