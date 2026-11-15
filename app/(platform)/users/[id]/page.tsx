import type { Metadata } from "next";
import ShareSeo from "@/components/seo/share-seo";
import { shareMetadataFor } from "@/lib/share-metadata";
import MemberProfileView from "@/components/profile/member-profile-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return shareMetadataFor("profile", (await params).id);
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  return (
    <>
      <ShareSeo kind="profile" id={id} />
      <MemberProfileView id={id} />
    </>
  );
}
