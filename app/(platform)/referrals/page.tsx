import ReferralsView from "@/components/referrals/referrals-view";
import { redirect } from "next/navigation";

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
