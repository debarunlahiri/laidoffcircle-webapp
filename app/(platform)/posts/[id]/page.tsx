import type { Metadata } from "next";
import { shareMetadataFor } from "@/lib/share-metadata";
import PostDetailView from "@/components/feed/post-detail-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return shareMetadataFor("post", (await params).id);
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostDetailView id={id} />;
}
