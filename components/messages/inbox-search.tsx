import { Search } from "lucide-react";

export default function InboxSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="inbox-search">
      <Search size={18} />
      <input
        aria-label="Search conversations"
        placeholder="Search messages"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
