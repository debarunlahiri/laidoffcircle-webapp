import type { Metadata } from "next";
import { shareMetadataFor } from "@/lib/share-metadata";
import ReferralDetailView from "@/components/referrals/referral-detail-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return shareMetadataFor("referral", (await params).id);
}

export default async function ReferralPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReferralDetailView id={id} />;
}
