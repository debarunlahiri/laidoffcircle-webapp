"use client";
import { api, apiMessage, utcDate } from "@/lib/api";
import type { ApiPoll } from "@/lib/api-types";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

function timeLeft(closesAt: string) {
  const minutes = Math.max(
    0,
    Math.round((utcDate(closesAt).getTime() - Date.now()) / 60000),
  );
  if (minutes >= 1440) return `${Math.round(minutes / 1440)}d left`;
  if (minutes >= 60) return `${Math.round(minutes / 60)}h left`;
  return `${Math.max(1, minutes)}m left`;
}

// A poll inside a post. Options vote on click (or pick several, then Vote);
// once you have voted, the poll closes, or it is your own poll, results show
// as bars and you can still change or remove your vote while it is open.
export default function PollView({
  postId,
  initial,
  own,
}: {
  postId: string;
  initial: ApiPoll;
  own: boolean;
}) {
  const [poll, setPoll] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [picked, setPicked] = useState<string[]>(initial.myVotes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setPoll(initial);
    setPicked(initial.myVotes);
  }, [initial]);

  const closed =
    poll.closed || (poll.closesAt && utcDate(poll.closesAt) <= new Date());
  const voted = poll.myVotes.length > 0;
  const showResults = (voted || closed || own) && !editing;
  const denominator = poll.allowMultiple ? poll.voters : poll.totalVotes;

  async function send(method: "PUT" | "DELETE", optionIds?: string[]) {
    setBusy(true);
    setError("");
    try {
      const next = await api<ApiPoll>(`/posts/${postId}/poll/vote`, {
        method,
        body: optionIds ? { optionIds } : undefined,
      });
      setPoll(next);
      setPicked(next.myVotes);
      setEditing(false);
    } catch (failure) {
      setError(apiMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  function choose(id: string) {
    if (busy) return;
    if (!poll.allowMultiple) return void send("PUT", [id]);
    setPicked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <div className="poll" role="group" aria-label="Poll">
      <div
        role={poll.allowMultiple ? "group" : "radiogroup"}
        className="poll-options"
      >
        {poll.options.map((option) => {
          const mine = poll.myVotes.includes(option.id);
          const percent = denominator
            ? Math.round((option.votes / denominator) * 100)
            : 0;
          if (showResults)
            return (
              <div
                key={option.id}
                className={`poll-result${mine ? " mine" : ""}`}
              >
                <span
                  className="poll-bar"
                  style={{ width: `${percent}%` }}
                  aria-hidden="true"
                />
                <span className="poll-label">
                  {mine && <Check size={14} aria-label="Your vote" />}
                  {option.text}
                </span>
                <span className="poll-percent">
                  {percent}%
                  <small>
                    {option.votes} {option.votes === 1 ? "vote" : "votes"}
                  </small>
                </span>
              </div>
            );
          const selected = picked.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              role={poll.allowMultiple ? "checkbox" : "radio"}
              aria-checked={selected}
              disabled={busy}
              className={`poll-option${selected ? " selected" : ""}`}
              onClick={() => choose(option.id)}
            >
              <span
                className={`poll-mark${poll.allowMultiple ? " square" : ""}`}
                aria-hidden="true"
              >
                {selected && <Check size={12} />}
              </span>
              {option.text}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="poll-error" role="alert">
          {error}
        </p>
      )}
      <div className="poll-footer">
        <span>
          {poll.voters} {poll.voters === 1 ? "voter" : "voters"} ·{" "}
          {closed
            ? "Final results"
            : poll.closesAt
              ? timeLeft(poll.closesAt)
              : "No end date"}
        </span>
        {!closed && !showResults && poll.allowMultiple && (
          <button
            type="button"
            className="primary"
            disabled={busy || !picked.length}
            onClick={() => void send("PUT", picked)}
          >
            Vote
          </button>
        )}
        {!closed && showResults && voted && (
          <span className="poll-actions">
            <button
              type="button"
              className="text-button"
              disabled={busy}
              onClick={() => setEditing(true)}
            >
              Change vote
            </button>
            <button
              type="button"
              className="text-button"
              disabled={busy}
              onClick={() => void send("DELETE")}
            >
              Remove vote
            </button>
          </span>
        )}
        {editing && (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setEditing(false);
              setPicked(poll.myVotes);
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
