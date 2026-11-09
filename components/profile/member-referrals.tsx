"use client";
import ReferralCard from "@/components/referrals/referral-card";
import { useApiList } from "@/hooks/use-api-resource";
import type { ApiReferral } from "@/lib/api-types";
import { toOpportunity } from "@/lib/referral-mapper";

export default function MemberReferrals({ id }: { id: string }) {
  const { data, loading, error, hasMore, loadMore } = useApiList<ApiReferral>(
    `/referrals?authorId=${id}&status=all`,
  );
  return (
    <div className="member-list">
      {data.map((item) => (
        <ReferralCard key={item.id} item={toOpportunity(item)} />
      ))}
      {loading && <p role="status">Loading referrals…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="empty card">No referral opportunities yet.</p>
      )}
      {hasMore && (
        <button className="secondary" disabled={loading} onClick={loadMore}>
          Load more referrals
        </button>
      )}
    </div>
  );
}
