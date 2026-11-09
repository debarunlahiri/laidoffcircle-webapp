import { ShieldCheck } from "lucide-react";
export default function CommunityNote({
  note,
  source,
}: {
  note: string;
  source?: string;
}) {
  return (
    <div className="community-note">
      <strong>
        <ShieldCheck size={16} />
        Community context <span>Reviewed</span>
      </strong>
      <p>{note}</p>
      {source && /^https?:\/\//.test(source) && (
        <a href={source} target="_blank" rel="noopener noreferrer">
          View supporting source
        </a>
      )}
    </div>
  );
}
