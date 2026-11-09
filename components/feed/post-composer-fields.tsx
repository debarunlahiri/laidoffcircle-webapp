"use client";

import {
  AddPhotosLabel,
  PhotoGrid,
  usePhotoPicker,
} from "@/components/feed/composer-photos";
import PollBuilder from "@/components/feed/poll-builder";
import QuotedPost from "@/components/feed/quoted-post";
import CompanyAutocomplete from "@/components/ui/company-autocomplete";
import MarkdownEditor from "@/components/ui/markdown-editor";
import SelectField from "@/components/ui/select-field";
import { apiMessage } from "@/lib/api";
import { maxPostImages, readImageFile } from "@/lib/image-file";
import { pastedImages } from "@/lib/paste-files";
import { usePlatform } from "@/providers/platform-provider";
import { BarChart3 } from "lucide-react";

// Both the feed composer and dialog use the same editor and draft controls.
export default function PostComposerFields() {
  const {
    draft,
    setDraft,
    topic,
    setTopic,
    company,
    setCompany,
    anonymous,
    setAnonymous,
    quoting,
    postImages,
    addPostImages,
    removePostImage,
    pollOpen,
    setPollOpen,
    postTopics,
    notify,
  } = usePlatform();
  const picker = usePhotoPicker({ onAdd: addPostImages, onError: notify });

  return (
    <div className="post-composer-fields">
      <div className="post-composer-editor">
        <MarkdownEditor
          autoFocus
          ariaLabel="Post text"
          maxLength={20000}
          rows={6}
          placeholder={
            quoting
              ? "Add your thoughts…"
              : pollOpen
                ? "Ask your question…"
                : "Your story, a question, a little encouragement…"
          }
          value={draft}
          onChange={setDraft}
          onPaste={async (event) => {
            const pasted = pastedImages(event);
            if (!pasted.length) return;
            const results = await Promise.allSettled(
              pasted.map((file) => readImageFile(file)),
            );
            const good = results.flatMap((result) =>
              result.status === "fulfilled" ? [result.value] : [],
            );
            const failed = results.find(
              (result) => result.status === "rejected",
            );
            if (failed) notify(apiMessage(failed.reason));
            if (good.length) addPostImages(good);
          }}
        />
        <small className="subtle-text">
          Use the toolbar to format your post, or write in Markdown.
        </small>
      </div>
      <PhotoGrid images={postImages} onRemove={removePostImage} />
      {quoting && (
        <QuotedPost
          asLink={false}
          post={{
            id: quoting.id,
            text: quoting.text,
            topic: quoting.topic,
            createdAt: quoting.createdAt ?? "",
            anonymous: !quoting.authorId,
            authorId: quoting.authorId ?? null,
            name: quoting.name,
            image: null,
          }}
        />
      )}
      {picker.input}
      <div className="post-composer-attachments" aria-label="Post attachments">
        <button
          type="button"
          className="text-button"
          disabled={postImages.length >= maxPostImages}
          onClick={picker.open}
        >
          <AddPhotosLabel count={postImages.length} />
        </button>
        {!quoting && (
          <button
            type="button"
            className="text-button"
            aria-pressed={pollOpen}
            onClick={() => setPollOpen(!pollOpen)}
          >
            <BarChart3 size={16} /> {pollOpen ? "Remove poll" : "Add poll"}
          </button>
        )}
      </div>
      {pollOpen && !quoting && <PollBuilder />}
      <div className="form-row">
        <SelectField
          label="Topic (optional)"
          placeholder="No topic"
          value={topic}
          options={[
            { value: "", label: "No topic" },
            ...postTopics.map((item) => ({ value: item, label: item })),
          ]}
          onChange={setTopic}
        />
        <CompanyAutocomplete value={company} onChange={setCompany} />
      </div>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(event) => setAnonymous(event.target.checked)}
        />
        Post anonymously
      </label>
    </div>
  );
}
