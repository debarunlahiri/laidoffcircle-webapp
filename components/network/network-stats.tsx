import { Handshake, Send, UserCheck, type LucideIcon } from "lucide-react";

type Stats = {
  connections: number;
  following: number;
  outgoingRequests: number;
};

// Headline numbers for the member's network, each with a tinted icon chip.
export default function NetworkStats({ stats }: { stats: Stats }) {
  const items: {
    label: string;
    value: number;
    icon: LucideIcon;
    tone: string;
  }[] = [
    {
      label: "Connections",
      value: stats.connections,
      icon: Handshake,
      tone: "blue",
    },
    {
      label: "Following",
      value: stats.following,
      icon: UserCheck,
      tone: "green",
    },
    {
      label: "Requests sent",
      value: stats.outgoingRequests,
      icon: Send,
      tone: "amber",
    },
  ];
  return (
    <section className="network-stats" aria-label="Your network">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <div className="card network-stat" key={label}>
          <span className="stat-text">
            <small>{label}</small>
            <strong>{value.toLocaleString()}</strong>
          </span>
          <span className={`stat-chip ${tone}`}>
            <Icon size={20} aria-hidden="true" />
          </span>
        </div>
      ))}
    </section>
  );
}
