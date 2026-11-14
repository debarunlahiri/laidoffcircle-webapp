"use client";
import Dialog from "@/components/ui/dialog";
import { releaseNotes } from "@/config/release-notes";
import { X } from "lucide-react";

export default function WhatsNewDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog label="What's new" onClose={onClose} closeOnOutsideClick>
      <div className="modal-heading">
        <h2>What’s new</h2>
        <button className="icon-button" aria-label="Close" onClick={onClose}>
          <X size={21} />
        </button>
      </div>
      <div className="release-notes">
        {releaseNotes.map((note, index) => (
          <section key={note.title}>
            {releaseNotes[index - 1]?.date !== note.date && (
              <small>{note.date}</small>
            )}
            <h3>{note.title}</h3>
            <ul>
              {note.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Dialog>
  );
}
