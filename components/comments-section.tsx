"use client";

import { LoadingSpinner } from "@/components/loading-spinner";
import { usePageLoading } from "@/components/page-loading-provider";
import { formatPostDate, getInitials } from "@/lib/social";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CommentAuthor = {
  id: string;
  name: string;
  email: string;
};

type CommentItem = {
  id: string;
  content: string;
  createdAt: string | Date;
  authorId: string;
  author: CommentAuthor;
};

type CommentsSectionProps = {
  postId: string;
  currentUserId: string;
  initialCommentCount: number;
  action?: React.ReactNode;
};

export function CommentsSection({
  postId,
  currentUserId,
  initialCommentCount,
  action,
}: CommentsSectionProps) {
  const router = useRouter();
  const { startLoading } = usePageLoading();
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadComments() {
      if (!isOpen || comments.length > 0 || isLoadingComments) {
        return;
      }

      setIsLoadingComments(true);

      try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
          method: "GET",
          cache: "no-store",
        });
        const json = (await response.json()) as {
          error?: string;
          comments?: CommentItem[];
        };

        if (!response.ok) {
          throw new Error(json.error || "Unable to load comments.");
        }

        if (!isCancelled) {
          setComments(json.comments ?? []);
          setCommentCount(json.comments?.length ?? 0);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load comments.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingComments(false);
        }
      }
    }

    void loadComments();

    return () => {
      isCancelled = true;
    };
  }, [comments.length, isLoadingComments, isOpen, postId]);

  async function handleSubmit() {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError("Write a comment first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const stopLoading = startLoading("Posting your comment...");

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmedContent,
        }),
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(json.error || "Unable to post comment.");
      }

      setContent("");
      setCommentCount((current) => current + 1);
      setComments((current) => [
        ...current,
        {
          id: `temp-${Date.now()}`,
          content: trimmedContent,
          createdAt: new Date().toISOString(),
          authorId: currentUserId,
          author: {
            id: currentUserId,
            name: "You",
            email: "",
          },
        },
      ]);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Something went wrong.",
      );
    } finally {
      stopLoading();
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:text-white"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V12A8.5 8.5 0 0 1 11.5 3.5h1A8.5 8.5 0 0 1 21 12Z" />
          </svg>
          <span>{commentCount}</span>
          <span>{commentCount === 1 ? "Comment" : "Comments"}</span>
        </button>
        {action}
      </div>

      {isOpen ? (
        <div className="mt-3 rounded-[1.35rem] border border-white/7 bg-[rgba(255,255,255,0.025)] p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-blue)]">
                Comments
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {commentCount} {commentCount === 1 ? "reply" : "replies"}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {isLoadingComments ? (
              <div className="rounded-[1rem] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-[var(--text-muted)]">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-[1rem] border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-[var(--text-muted)]">
                No comments yet.
              </div>
            ) : (
              comments.map((comment) => {
                const isOwnComment = comment.authorId === currentUserId;

                return (
                  <article
                    key={comment.id}
                    className="rounded-[1rem] border border-white/7 bg-[rgba(9,14,23,0.72)] px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="avatar-chip h-9 w-9 shrink-0 text-sm">
                        {getInitials(comment.author.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">{comment.author.name}</p>
                          {isOwnComment ? (
                            <span className="inline-flex rounded-full bg-[rgba(247,188,85,0.14)] px-2 py-0.5 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[#ffd18a]">
                              You
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {formatPostDate(new Date(comment.createdAt))}
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#e3ebf7]">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="mt-4">
            <textarea
              className="app-input min-h-[6.5rem]"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write a comment..."
              maxLength={280}
              disabled={isSubmitting}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--text-muted)]">{content.trim().length}/280</p>
              <button
                type="button"
                onClick={handleSubmit}
                className="app-button app-button-secondary min-w-28"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : null}
                {isSubmitting ? "Posting..." : "Comment"}
              </button>
            </div>
            {error ? <p className="mt-3 text-sm text-[var(--error)]">{error}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
