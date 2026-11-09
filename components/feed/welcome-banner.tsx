"use client";

import { usePlatform } from "@/providers/platform-provider";
import { ArrowRight, BriefcaseBusiness, Users } from "lucide-react";

export default function WelcomeBanner() {
  const { navigate } = usePlatform();

  return (
    <section className="welcome-banner">
      <div className="welcome-content">
        <span className="banner-kicker">YOUR NEXT CHAPTER</span>
        <h2>Good things start with a connection.</h2>
        <p>
          Meet people who get it. Share what’s on your mind, find a referral,
          and take your next step together.
        </p>
        <div className="welcome-actions">
          <button className="primary" onClick={() => navigate("My network")}>
            Meet your people <ArrowRight size={17} />
          </button>
          <button
            className="welcome-secondary"
            onClick={() => navigate("Referrals")}
          >
            Explore referrals <BriefcaseBusiness size={17} />
          </button>
        </div>
      </div>
      <div className="welcome-community" aria-hidden="true">
        <div className="welcome-community-icon">
          <Users size={28} />
        </div>
        <strong>A shared way forward.</strong>
        <span>One conversation at a time.</span>
      </div>
    </section>
  );
}
