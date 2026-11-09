"use client";
import { api, apiMessage, invalidate } from "@/lib/api";
import type { ApiComment } from "@/lib/api-types";
import { useState } from "react";

// Writes for comment threads: posting, replying and reacting.
export function useCommentActions(
  postId: string,
  notify: (message: string) => void,
) {
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setPending(true);
    try {
      await action();
      invalidate("posts");
      return true;
    } catch (error) {
      notify(apiMessage(error));
      return false;
    } finally {
      setPending(false);
    }
  }

  return {
    pending,
    // parentId may point at a reply; the API keeps threads two levels deep.
    post: (text: string, parentId?: string, file?: File) =>
      run(async () => {
        let uploadId: string | undefined;
        if (file) {
          const form = new FormData();
          form.append("photo", file);
          uploadId = (
            await api<{ id: string }>("/uploads", {
              method: "POST",
              body: form,
            })
          ).id;
        }
        await api(`/posts/${postId}/comments`, {
          method: "POST",
          body: { text, parentId, uploadId },
        });
      }),
    edit: (commentId: string, text: string) =>
      run(() =>
        api(`/posts/${postId}/comments/${commentId}`, {
          method: "PATCH",
          body: { text },
        }),
      ),
    react: (comment: ApiComment, reaction: "like" | "dislike") =>
      run(() =>
        api(`/posts/${postId}/comments/${comment.id}/reaction`, {
          method: comment.myReaction === reaction ? "DELETE" : "PUT",
          body: { reaction },
        }),
      ),
  };
}
