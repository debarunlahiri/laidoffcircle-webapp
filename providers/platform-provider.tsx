"use client";

import { useApiResource } from "@/hooks/use-api-resource";
import { useNotifications } from "@/hooks/use-notifications";
import { requireSignIn } from "@/lib/api";
import type { ApiCompany } from "@/lib/api-types";
import { useRealtimeConnection } from "@/hooks/use-realtime";
import { useAuth } from "@/providers/auth-provider";
import { useCommunityNotes } from "@/hooks/use-community-notes";
import { useReferrals } from "@/hooks/use-referrals";
import { useFeed } from "@/hooks/use-feed";
import { useInterface } from "@/hooks/use-interface";
import { useMessages } from "@/hooks/use-messages";
import { useNetwork } from "@/hooks/use-network";
import { usePlatformNavigation } from "@/hooks/use-platform-navigation";
import { usePostReports } from "@/hooks/use-post-reports";
import { usePostTopics } from "@/hooks/use-post-topics";
import { usePostComposer } from "@/hooks/use-post-composer";
import { useToast } from "@/hooks/use-toast";
import { useWorkforceInsights } from "@/hooks/use-workforce-insights";
import { useRouter } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";

function usePlatformState() {
  const { user } = useAuth();
  const live = useRealtimeConnection(user?.id);
  const router = useRouter();
  const navigation = usePlatformNavigation();
  const notifications = useToast();
  const referrals = useReferrals(
    notifications.notify,
    navigation.section === "Referrals" ? navigation.search : "",
  );
  const network = useNetwork(notifications.notify, user?.id ?? "");
  const feed = useFeed(
    navigation.section,
    navigation.search,
    notifications.notify,
  );
  const composer = usePostComposer({
    setTab: feed.setTab,
    navigate: navigation.navigate,
    notify: notifications.notify,
  });
  const communityNotes = useCommunityNotes({ notify: notifications.notify });
  const messages = useMessages(
    navigation.section,
    user?.id ?? "",
    notifications.notify,
    navigation.navigate,
    live,
  );
  const workforceInsights = useWorkforceInsights(
    navigation.section,
    notifications.notify,
  );
  const alerts = useNotifications(notifications.notify, live);
  const companies = useApiResource<ApiCompany[]>("/companies?limit=100", []);
  const postTopics = usePostTopics();
  const reports = usePostReports(notifications.notify);
  const ui = useInterface();

  return {
    currentUser: user,
    companies: companies.data,
    postTopics,
    ...alerts,
    ...navigation,
    ...network,
    ...referrals,
    ...feed,
    ...notifications,
    ...composer,
    ...communityNotes,
    ...messages,
    ...workforceInsights,
    ...ui,
    ...reports,
    // Guests get the sign-in prompt instead of opening a form they can't submit.
    setComposer: ((value) => {
      if (value && !user) return requireSignIn();
      composer.setComposer(value);
    }) as typeof composer.setComposer,
    openQuoteComposer: ((post) => {
      if (!user) return requireSignIn();
      composer.openQuoteComposer(post);
    }) as typeof composer.openQuoteComposer,
    // The referral form is its own page, not a dialog.
    openReferralForm: () => {
      if (!user) return requireSignIn();
      router.push("/referrals/new");
    },
    openReportDialog: (id: string) => {
      if (!user) return requireSignIn();
      reports.openReportDialog(id);
    },
    openNoteDialog: (id: string) => {
      if (!user) return requireSignIn();
      communityNotes.openNoteDialog(id);
    },
  };
}

type PlatformState = ReturnType<typeof usePlatformState>;
const PlatformContext = createContext<PlatformState | null>(null);

function PlatformSession({ children }: { children: ReactNode }) {
  const state = usePlatformState();
  return (
    <PlatformContext.Provider value={state}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context)
    throw new Error("usePlatform must be used within PlatformProvider");
  return context;
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <PlatformSession key={user?.id ?? "guest"}>{children}</PlatformSession>
  );
}
