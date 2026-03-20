"use client";

import { LoadingSpinner } from "@/components/loading-spinner";
import { usePageLoading } from "@/components/page-loading-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeletePostButtonProps = {
  postId: string;
};

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const router = useRouter();
  const { startLoading } = usePageLoading();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const isConfirmed = window.confirm(
      "Delete this post? This action cannot be undone.",
    );

    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    const stopLoading = startLoading("Deleting your post...");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(json.error || "Unable to delete post.");
      }

      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Something went wrong.",
      );
    } finally {
      stopLoading();
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDelete}
        className="app-button app-button-ghost min-w-24 px-3 py-2 text-xs text-[var(--error)]"
        disabled={isDeleting}
      >
        {isDeleting ? <LoadingSpinner size="sm" /> : null}
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
      {error ? <p className="text-right text-xs text-[var(--error)]">{error}</p> : null}
    </div>
  );
}
