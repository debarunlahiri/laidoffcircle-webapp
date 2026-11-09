import VerifiedBadge from "@/components/ui/verified-badge";
import { displayDate, mediaUrl } from "@/lib/api";
import type { ApiQuotedPost } from "@/lib/api-types";
import Link from "next/link";
import { Quote } from "lucide-react";

// A compact embed of the post being quoted. Plain text (markdown markers stripped)
// so it stays small; links to the original post unless `static`.
const plain = (text: string) =>
  text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default function QuotedPost({
  post,
  asLink = true,
}: {
  post: ApiQuotedPost;
  asLink?: boolean;
}) {
  const body = (
    <>
      <span className="quoted-head">
        <Quote size={13} aria-hidden="true" />
        <strong>
          {post.name}
          <VerifiedBadge type={post.badge} />
        </strong>
        <span>· {displayDate(post.createdAt)}</span>
      </span>
      {post.text && <span className="quoted-text">{plain(post.text)}</span>}
      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="quoted-image" src={mediaUrl(post.image)} alt="" />
      )}
    </>
  );
  return asLink ? (
    <Link className="quoted-post" href={`/posts/${post.id}`}>
      {body}
    </Link>
  ) : (
    <div className="quoted-post static">{body}</div>
  );
}
