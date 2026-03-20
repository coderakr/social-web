"use client";

import { LoadingSpinner } from "@/components/loading-spinner";
import { usePageLoading } from "@/components/page-loading-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RequestButtonProps = {
  userId: string;
};

type FriendshipActionProps = {
  friendshipId: string;
  action: "accept" | "reject";
};

export function SendFriendRequestButton({ userId }: RequestButtonProps) {
  const router = useRouter();
  const { startLoading } = usePageLoading();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);
    setError(null);
    const stopLoading = startLoading("Sending friend request...");

    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(json.error || "Unable to send request.");
      }

      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Something went wrong.",
      );
    } finally {
      stopLoading();
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleClick}
        className="app-button app-button-secondary min-w-24 w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? <LoadingSpinner size="sm" /> : null}
        {isSubmitting ? "Sending..." : "Add friend"}
      </button>
      {error ? <p className="text-right text-xs text-[var(--error)]">{error}</p> : null}
    </div>
  );
}

export function FriendshipActionButton({
  friendshipId,
  action,
}: FriendshipActionProps) {
  const router = useRouter();
  const { startLoading } = usePageLoading();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);
    setError(null);
    const stopLoading = startLoading(
      action === "accept" ? "Accepting friend request..." : "Rejecting friend request...",
    );

    try {
      const response = await fetch(`/api/friends/${friendshipId}/${action}`, {
        method: "POST",
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(json.error || `Unable to ${action} request.`);
      }

      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Something went wrong.",
      );
    } finally {
      stopLoading();
      setIsSubmitting(false);
    }
  }

  const label = action === "accept" ? "Accept" : "Reject";
  const className =
    action === "accept"
      ? "app-button app-button-primary min-w-20"
      : "app-button app-button-ghost min-w-20";

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        className={`${className} w-full sm:w-auto`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <LoadingSpinner
            size="sm"
            className={action === "accept" ? "border-t-[#1f1302]" : ""}
          />
        ) : null}
        {isSubmitting ? `${label}ing...` : label}
      </button>
      {error ? <p className="text-right text-xs text-[var(--error)]">{error}</p> : null}
    </div>
  );
}
