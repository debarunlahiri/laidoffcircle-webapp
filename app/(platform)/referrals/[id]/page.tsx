import ReferralDetailView from "@/components/referrals/referral-detail-view";

export default async function ReferralPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReferralDetailView id={id} />;
}
