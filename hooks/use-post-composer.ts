"use client";
import { useState } from "react";
import { api, apiMessage, invalidate } from "@/lib/api";
import { maxPostImages } from "@/lib/image-file";
import type { Post } from "@/types";

export const maxPollOptions = 6;
export const minPollOptions = 2;
// Hours; "0" means the poll never closes.
export const pollDurations = [
  { value: "24", label: "1 day" },
  { value: "72", label: "3 days" },
  { value: "168", label: "1 week" },
  { value: "336", label: "2 weeks" },
  { value: "0", label: "No end date" },
];
export function usePostComposer({
  setTab,
  navigate,
  notify,
}: {
  setTab: (tab: string) => void;
  navigate: (section: string) => void;
  notify: (message: string) => void;
}) {
  const [composer, setComposerOpen] = useState(false);
  // The post being quoted, when the composer was opened from "Quote".
  const [quoting, setQuoting] = useState<Post | null>(null);
  const setComposer = (open: boolean) => {
    setComposerOpen(open);
    if (!open) setQuoting(null);
  };
  const openQuoteComposer = (post: Post) => {
    setQuoting(post);
    setComposerOpen(true);
  };
  const [postImages, setPostImages] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [topic, setTopic] = useState("");
  const [company, setCompany] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [postSaving, setPostSaving] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollMultiple, setPollMultiple] = useState(false);
  const [pollHours, setPollHours] = useState("168");
  const filledOptions = pollOptions.map((item) => item.trim()).filter(Boolean);
  const pollProblem = !pollOpen
    ? ""
    : !draft.trim()
      ? "Write your question in the post box above."
      : filledOptions.length < minPollOptions
        ? "Add at least 2 options."
        : new Set(filledOptions.map((item) => item.toLowerCase())).size !==
            filledOptions.length
          ? "Options must be different from each other."
          : "";
  const addPollOption = () =>
    setPollOptions((current) =>
      current.length >= maxPollOptions ? current : [...current, ""],
    );
  const removePollOption = (index: number) =>
    setPollOptions((current) =>
      current.length <= minPollOptions
        ? current
        : current.filter((_, i) => i !== index),
    );
  const setPollOption = (index: number, value: string) =>
    setPollOptions((current) =>
      current.map((item, i) => (i === index ? value : item)),
    );
  function resetPoll() {
    setPollOpen(false);
    setPollOptions(["", ""]);
    setPollMultiple(false);
    setPollHours("168");
  }
  // Adds photos up to the limit and says so when some were left out.
  function addPostImages(dataUrls: string[]) {
    setPostImages((current) => {
      const next = [...current, ...dataUrls].slice(0, maxPostImages);
      if (current.length + dataUrls.length > maxPostImages)
        notify(`You can add up to ${maxPostImages} photos per post.`);
      return next;
    });
  }
  const removePostImage = (index: number) =>
    setPostImages((current) => current.filter((_, i) => i !== index));
  // A post needs text or at least one photo.
  const canPublish = Boolean(draft.trim() || postImages.length) && !pollProblem;

  async function publish() {
    if (postSaving || !canPublish) return false;
    setPostSaving(true);
    try {
      const uploadIds: string[] = [];
      for (const image of postImages) {
        const blob = await (await fetch(image)).blob();
        const body = new FormData();
        body.append("photo", blob, "post-photo");
        uploadIds.push(
          (await api<{ id: string }>("/uploads", { method: "POST", body })).id,
        );
      }
      await api("/posts", {
        method: "POST",
        body: {
          text: draft.trim(),
          topic: topic || "General discussion",
          companyId: company || null,
          anonymous,
          uploadIds,
          quotedPostId: quoting?.id ?? null,
          poll: pollOpen && !quoting
            ? {
                options: filledOptions,
                allowMultiple: pollMultiple,
                durationHours: Number(pollHours) || null,
              }
            : null,
        },
      });
      setDraft("");
      setPostImages([]);
      resetPoll();
      setCompany("");
      setTopic("");
      setAnonymous(false);
      setComposer(false);
      setTab("Latest");
      navigate("Home");
      invalidate("posts");
      notify(quoting ? "Your quote has been posted." : "Your post has been published.");
      return true;
    } catch (error) {
      notify(apiMessage(error));
      return false;
    } finally {
      setPostSaving(false);
    }
  }
  return {
    composer,
    setComposer,
    quoting,
    openQuoteComposer,
    postImages,
    addPostImages,
    removePostImage,
    canPublish,
    pollOpen,
    setPollOpen,
    pollOptions,
    addPollOption,
    removePollOption,
    setPollOption,
    pollMultiple,
    setPollMultiple,
    pollHours,
    setPollHours,
    pollProblem,
    draft,
    setDraft,
    topic,
    setTopic,
    company,
    setCompany,
    anonymous,
    setAnonymous,
    publish,
    postSaving,
  };
}
