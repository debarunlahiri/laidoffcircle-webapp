"use client";
import { useState } from "react";
import { api, apiMessage, invalidate } from "@/lib/api";
export function useCommunityNotes({
  notify,
}: {
  notify: (message: string) => void;
}) {
  const [notePost, setNotePost] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [source, setSource] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const canProposeNote = Boolean(
    note.trim() && /^https?:\/\/\S+\.\S+/.test(source),
  );
  function openNoteDialog(id: string) {
    setNotePost(id);
    setNote("");
    setSource("");
  }
  async function submit() {
    if (!notePost || noteSaving) return;
    setNoteSaving(true);
    try {
      await api(`/posts/${notePost}/notes`, {
        method: "POST",
        body: { text: note.trim(), sourceUrl: source.trim() },
      });
      setNotePost(null);
      invalidate("posts");
      notify("Community note proposed for review.");
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setNoteSaving(false);
    }
  }
  return {
    notePost,
    setNotePost,
    note,
    setNote,
    source,
    setSource,
    openNoteDialog,
    canProposeNote,
    noteSaving,
    proposeNote: submit,
  };
}
