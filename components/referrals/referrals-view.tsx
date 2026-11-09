"use client";
import PillTabs from "@/components/ui/pill-tabs";
import ReferralCard from "@/components/referrals/referral-card";
import ReferralFiltersBar from "@/components/referrals/referral-filters";
import {
  useReferralBoard,
  type ReferralView,
} from "@/hooks/use-referral-board";
import { useAuth } from "@/providers/auth-provider";
import { usePlatform } from "@/providers/platform-provider";
import { BriefcaseBusiness } from "lucide-react";

const tabs: { key: ReferralView; label: string; personal: boolean }[] = [
  { key: "all", label: "All", personal: false },
  { key: "available", label: "Available", personal: true },
  { key: "mine", label: "My referrals", personal: true },
  { key: "requested", label: "Requested", personal: true },
];

export default function ReferralsView() {
  const { user } = useAuth();
  const { openReferralForm } = usePlatform();
  const board = useReferralBoard();
  const { filters } = board;
  const searching = board.activeCount > 0 || Boolean(filters.search.trim());

  return (
    <>
      <PillTabs
        label="Referral views"
        items={tabs.filter((tab) => user || !tab.personal)}
        active={filters.view}
        onChange={(view) => board.setFilters({ view })}
      />
      <ReferralFiltersBar
        filters={filters}
        activeCount={board.activeCount}
        signedIn={Boolean(user)}
        onChange={board.setFilters}
        onReset={board.reset}
      />
      <div className="section-bar">
        <h2>Opportunities with a human connection</h2>
        {!board.loading && (
          <small className="result-count">
            {board.items.length}
            {board.hasMore ? "+" : ""} shown
          </small>
        )}
      </div>
      {board.items.map((item) => (
        <ReferralCard key={item.id} item={item} />
      ))}
      {board.loading && <p role="status">Loading referrals…</p>}
      {board.error && <p role="alert">{board.error}</p>}
      {board.hasMore && (
        <button
          className="secondary"
          disabled={board.loading}
          onClick={() => void board.loadMore()}
        >
          Load more referrals
        </button>
      )}
      {!board.loading && !board.error && board.items.length === 0 && (
        <div className="empty card">
          <BriefcaseBusiness size={28} />
          <h3>
            {searching
              ? "No referrals match these filters."
              : filters.view === "mine"
                ? "You haven’t added a referral yet."
                : filters.view === "requested"
                  ? "You haven’t requested a referral yet."
                  : "No available referrals right now."}
          </h3>
          <p>
            {searching
              ? "Try removing a filter or searching for something broader."
              : filters.view === "mine"
                ? "Share an opportunity and help someone take their next step."
                : "Explore the opportunities to find your next connection."}
          </p>
          <button
            className="text-button"
            onClick={() => {
              if (searching) {
                board.reset();
                board.setFilters({ search: "" });
              } else if (filters.view === "mine") openReferralForm();
              else board.setFilters({ view: "all" });
            }}
          >
            {searching
              ? "Clear filters"
              : filters.view === "mine"
                ? "Add referrals"
                : "View all referrals"}
          </button>
        </div>
      )}
      <p className="subtle-text">
        Referrals are voluntary and always free. Requests are shared with the
        person offering the referral.
      </p>
    </>
  );
}
