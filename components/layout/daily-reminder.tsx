"use client";
import { useApiResource } from "@/hooks/use-api-resource";
import type { ApiDailyReminder } from "@/lib/api-types";
import { Leaf } from "lucide-react";

export default function DailyReminder() {
  const { data } = useApiResource<ApiDailyReminder | null>(
    "/daily-reminder",
    null,
  );
  if (!data) return null;
  return (
    <section className="card daily-card">
      <div className="rail-heading">
        <h3>Your daily reminder</h3>
        <Leaf size={17} />
      </div>
      <p>“{data.quote}”</p>
      <span>{data.supportingText}</span>
      <div className="quote-decoration" />
    </section>
  );
}
