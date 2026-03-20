"use client";

import { LoadingSpinner } from "@/components/loading-spinner";
import { usePageLoading } from "@/components/page-loading-provider";
import { signOut } from "@/lib/auth-client";
import { useState } from "react";

export function SignOutButton() {
  const { startLoading } = usePageLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsSubmitting(true);
    setError(null);
    const stopLoading = startLoading("Signing you out...");
    let shouldStopLoading = true;

    try {
      const response = await signOut({
        fetchOptions: {
          onSuccess: () => {
            shouldStopLoading = false;
            window.location.href = "/sign-in";
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Unable to sign out.");
      }
    } catch (signOutError) {
      setError(
        signOutError instanceof Error ? signOutError.message : "Unable to sign out.",
      );
    } finally {
      if (shouldStopLoading) {
        stopLoading();
      }
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="app-button app-button-ghost"
        onClick={handleClick}
        disabled={isSubmitting}
      >
        {isSubmitting ? <LoadingSpinner size="sm" /> : null}
        {isSubmitting ? "Signing out..." : "Sign out"}
      </button>
      {error ? <p className="text-xs text-[var(--error)]">{error}</p> : null}
    </div>
  );
}
