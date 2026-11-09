"use client";
import { usePlatform } from "@/providers/platform-provider";
import { ArrowRight, BriefcaseBusiness, ChevronRight } from "lucide-react";

export default function ReferralSuggestions() {
  const { navigate, opportunities } = usePlatform();

  return (
    <section className="card rail-card">
      <div className="rail-heading">
        <h3>Doors worth opening</h3>
        <BriefcaseBusiness size={17} />
      </div>
      <p className="rail-subtitle">Real people. A helping hand.</p>
      {opportunities
        .filter((item) => item.status === "open")
        .slice(0, 2)
        .map((item) => (
          <button
            className="mini-opportunity"
            key={item.id ?? `${item.company}-${item.title}`}
            onClick={() => navigate("Referrals")}
          >
            <span className={`company-logo ${item.color}`}>{item.letter}</span>
            <span>
              <strong>{item.title}</strong>
              <small>
                {item.company} · {item.location.split(" · ")[0]}
              </small>
              <span className="referral-label">
                <span className="status-dot" />
                Referrals available
              </span>
            </span>
            <ChevronRight size={15} />
          </button>
        ))}
      <button className="rail-link" onClick={() => navigate("Referrals")}>
        Find referral opportunities <ArrowRight size={15} />
      </button>
    </section>
  );
}
