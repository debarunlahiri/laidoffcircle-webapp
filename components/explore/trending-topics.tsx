"use client";
import { useApiResource } from "@/hooks/use-api-resource";
import { usePlatform } from "@/providers/platform-provider";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export default function TrendingTopics() {
  const { setExploreTopic, navigate } = usePlatform();

  const result = useApiResource<{ topic: string; posts: number }[]>(
    "/posts/topics",
    [],
    45000,
  );
  return (
    <section className="rail-trending">
      <div className="rail-heading">
        <h3>In the conversation</h3>
        <TrendingUp size={17} />
      </div>
      {result.error && <p role="alert">{result.error}</p>}
      {!result.loading && !result.error && !result.data.length && (
        <p className="subtle-text">
          Conversations will appear here as people post.
        </p>
      )}
      {result.data.map(({ topic, posts }, i) => (
        <button
          key={topic}
          onClick={() => {
            navigate("Explore");
            setExploreTopic(topic);
          }}
        >
          <span className="trend-number">0{i + 1}</span>
          <span>
            <strong>{topic}</strong>
            <small>
              {posts} {posts === 1 ? "post" : "posts"}
            </small>
          </span>
          <ArrowUpRight size={14} />
        </button>
      ))}
    </section>
  );
}
