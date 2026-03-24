"use client";

import { useRef } from "react";
import { useState } from "react";

type ReactionKind = "LIKE" | "DISLIKE";

type PostReactionButtonsProps = {
  postId: string;
  initialLikes: number;
  initialDislikes: number;
  initialReaction: ReactionKind | null;
};

export function PostReactionButtons({
  postId,
  initialLikes,
  initialDislikes,
  initialReaction,
}: PostReactionButtonsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [currentReaction, setCurrentReaction] = useState<ReactionKind | null>(initialReaction);
  const [error, setError] = useState<string | null>(null);
  const mutationIdRef = useRef(0);

  async function handleReaction(nextKind: ReactionKind) {
    const previousReaction = currentReaction;
    const previousLikes = likes;
    const previousDislikes = dislikes;
    const nextReaction = previousReaction === nextKind ? null : nextKind;
    const mutationId = ++mutationIdRef.current;

    setError(null);

    if (previousReaction === "LIKE") {
      setLikes((current) => current - 1);
    }

    if (previousReaction === "DISLIKE") {
      setDislikes((current) => current - 1);
    }

    if (nextReaction === "LIKE") {
      setLikes((current) => current + 1);
    }

    if (nextReaction === "DISLIKE") {
      setDislikes((current) => current + 1);
    }

    setCurrentReaction(nextReaction);

    try {
      const response = await fetch(`/api/posts/${postId}/reaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: nextReaction,
        }),
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(json.error || "Unable to update reaction.");
      }
    } catch (reactionError) {
      if (mutationId === mutationIdRef.current) {
        setCurrentReaction(previousReaction);
        setLikes(previousLikes);
        setDislikes(previousDislikes);
        setError(
          reactionError instanceof Error ? reactionError.message : "Something went wrong.",
        );
      }
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleReaction("LIKE")}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
            currentReaction === "LIKE"
              ? "border-[rgba(87,215,162,0.26)] bg-[rgba(87,215,162,0.12)] text-[#9ceec8]"
              : "border-white/8 bg-white/[0.03] text-[var(--text-muted)] hover:text-white"
          }`}
        >
          <span aria-hidden="true">👍</span>
          <span>{likes}</span>
        </button>
        <button
          type="button"
          onClick={() => handleReaction("DISLIKE")}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
            currentReaction === "DISLIKE"
              ? "border-[rgba(255,110,123,0.26)] bg-[rgba(255,110,123,0.12)] text-[#ffb1b9]"
              : "border-white/8 bg-white/[0.03] text-[var(--text-muted)] hover:text-white"
          }`}
        >
          <span aria-hidden="true">👎</span>
          <span>{dislikes}</span>
        </button>
      </div>
      {error ? <p className="text-right text-xs text-[var(--error)]">{error}</p> : null}
    </div>
  );
}
