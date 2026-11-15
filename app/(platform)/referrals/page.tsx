import type { Metadata } from "next";
import { pageMetadata } from "@/lib/share-metadata";
import ReferralsView from "@/components/referrals/referrals-view";
import { redirect } from "next/navigation";

export const metadata: Metadata = pageMetadata({
  title: "Employee referrals from people who can help · LaidOffCircle",
  description:
    "Open employee referrals offered by members, with role, company, location and skills. A connection can open a door.",
  path: "/referrals",
});

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const { id } = await searchParams;
  if (typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id))
    redirect(`/referrals/${id}`);
  return <ReferralsView />;
}
