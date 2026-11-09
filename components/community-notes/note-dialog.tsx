"use client";
import Dialog from "@/components/ui/dialog";
import { usePlatform } from "@/providers/platform-provider";
import { X } from "lucide-react";

export default function NoteDialog() {
  const {
    notePost,
    setNotePost,
    note,
    setNote,
    source,
    setSource,
    proposeNote,
    canProposeNote,
    noteSaving,
  } = usePlatform();

  if (notePost === null) return null;

  return (
    <Dialog label="Add community context" onClose={() => setNotePost(null)}>
      <div className="modal-heading">
        <h2>Add community context</h2>
        <button
          className="icon-button"
          aria-label="Close"
          onClick={() => setNotePost(null)}
        >
          <X />
        </button>
      </div>
      <p>
        Help others understand a checkable claim. Notes are proposed for review,
        and are not automatically verified.
      </p>
      <textarea
        placeholder="Add relevant, factual context…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <label className="field-label">
        Supporting source URL
        <input
          type="url"
          placeholder="https://…"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </label>
      <div className="modal-bottom">
        <span />
        <button
          className="primary"
          disabled={!canProposeNote || noteSaving}
          onClick={proposeNote}
        >
          Propose note
        </button>
      </div>
    </Dialog>
  );
}
