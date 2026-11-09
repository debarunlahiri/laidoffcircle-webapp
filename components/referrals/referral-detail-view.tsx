"use client";
import ReferralCard from "@/components/referrals/referral-card";
import { useApiResource } from "@/hooks/use-api-resource";
import { queryPath } from "@/lib/api";
import type { ApiReferral } from "@/lib/api-types";
import { toOpportunity } from "@/lib/referral-mapper";

export default function ReferralDetailView({ id }: { id: string }) {
  const { data, loading, error } = useApiResource<ApiReferral[]>(
    queryPath("/referrals", { id, limit: 1 }),
    [],
  );
  const referral = data[0];

  return (
    <div className="post-detail">
      {loading && !referral && <p role="status">Loading referral…</p>}
      {!loading && !referral && (
        <div className="card empty-state" role="alert">
          <strong>This referral isn’t available</strong>
          <p className="subtle-text">{error || "It may have been removed."}</p>
        </div>
      )}
      {referral && <ReferralCard item={toOpportunity(referral)} full />}
    </div>
  );
}
