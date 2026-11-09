"use client";
import PostCard from "@/components/feed/post-card";
import PersonCard from "@/components/network/person-card";
import ReferralCard from "@/components/referrals/referral-card";
import type {
  ApiCompany,
  ApiPerson,
  ApiPost,
  ApiReferral,
  SearchGroup,
} from "@/lib/api-types";
import { toPerson } from "@/lib/person-mapper";
import { toPost } from "@/lib/post-mapper";
import { toOpportunity } from "@/lib/referral-mapper";
import { usePlatform } from "@/providers/platform-provider";
import { Building2, Hash } from "lucide-react";
import Link from "next/link";
import { searchHref } from "./suggestions";

function CompanyCard({ company }: { company: ApiCompany }) {
  return (
    <article className="card company-result">
      <span className="company-logo purple">
        {company.name[0]?.toUpperCase() ?? <Building2 size={18} />}
      </span>
      <strong>{company.name}</strong>
      <div className="company-result-links">
        <Link href={searchHref(company.name, "posts")}>Posts</Link>
        <Link href={searchHref(company.name, "referrals")}>Referrals</Link>
      </div>
    </article>
  );
}

function TopicChip({ topic }: { topic: string }) {
  const { setExploreTopic, navigate } = usePlatform();
  return (
    <button
      className="secondary topic-result"
      onClick={() => {
        setExploreTopic(topic);
        navigate("Explore");
      }}
    >
      <Hash size={16} /> {topic}
    </button>
  );
}

// Renders one group of results with the shared, real components.
export default function ResultGroup({
  group,
  items,
}: {
  group: SearchGroup;
  items: unknown[];
}) {
  switch (group) {
    case "users":
      return (
        <div className="people-grid">
          {(items as ApiPerson[]).map((person) => (
            <PersonCard key={person.id} person={toPerson(person)} />
          ))}
        </div>
      );
    case "posts":
      return (
        <div className="member-list">
          {(items as ApiPost[]).map((post) => (
            <PostCard key={post.id} post={toPost(post)} />
          ))}
        </div>
      );
    case "referrals":
      return (
        <div className="member-list">
          {(items as ApiReferral[]).map((item) => (
            <ReferralCard key={item.id} item={toOpportunity(item)} />
          ))}
        </div>
      );
    case "companies":
      return (
        <div className="people-grid">
          {(items as ApiCompany[]).map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      );
    case "topics":
      return (
        <div className="topic-results">
          {(items as string[]).map((topic) => (
            <TopicChip key={topic} topic={topic} />
          ))}
        </div>
      );
  }
}
