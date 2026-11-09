import MemberProfileView from "@/components/profile/member-profile-view";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <MemberProfileView id={(await params).id} />;
}
