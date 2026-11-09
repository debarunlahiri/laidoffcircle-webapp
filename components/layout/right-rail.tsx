"use client";
import TrendingTopics from "@/components/explore/trending-topics";
import DailyReminder from "@/components/layout/daily-reminder";
import PeopleSuggestions from "@/components/network/people-suggestions";
import ReferralSuggestions from "@/components/referrals/referral-suggestions";

import SiteFooter from "./site-footer";

export default function RightRail() {
  return (
    <aside className="right-rail">
      <DailyReminder />
      <PeopleSuggestions />
      <ReferralSuggestions />
      <TrendingTopics />
      <SiteFooter />
    </aside>
  );
}
