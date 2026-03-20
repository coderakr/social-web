"use client";

import { signIn, signUp } from "@/lib/auth-client";
import { LoadingLink } from "@/components/loading-link";
import { LoadingSpinner } from "@/components/loading-spinner";
import { usePageLoading } from "@/components/page-loading-provider";
import { useState } from "react";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthForm({ mode }: AuthFormProps) {
  const { startLoading } = usePageLoading();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const stopLoading = startLoading(isSignUp ? "Creating your account..." : "Signing you in...");
    let shouldStopLoading = true;

    try {
      const formData = new FormData(event.currentTarget);

      const response = isSignUp
        ? await signUp.email({
            name: String(formData.get("name") || ""),
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
          })
        : await signIn.email({
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
          });

      if (response.error) {
        setError(response.error.message || "Something went wrong.");
        return;
      }

      shouldStopLoading = false;
      window.location.href = "/home";
    } finally {
      if (shouldStopLoading) {
        stopLoading();
      }
      setIsSubmitting(false);
    }
  }

  return (
    <div className="shell flex min-h-screen items-center justify-center px-5 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_420px]">
        <section className="hidden items-center lg:flex">
          <div className="max-w-xl">
            <p className="brand-mark text-xl font-semibold">Social Web</p>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white">
              Friends, photos, and a cleaner feed.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--text-muted)]">
              Built like a compact private network: central feed, clean photo cards, and simple
              friend flows.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Dark feed", "Calmer layout with Instagram-like hierarchy."],
                ["Photo + text", "One composer for quick updates."],
                ["Private circle", "Only accepted friends appear in feed."],
              ].map(([title, copy]) => (
                <div key={title} className="sidebar-card rounded-[1.25rem] p-4">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="feed-card rounded-[1.75rem] p-8 md:p-10">
          <p className="text-center text-3xl font-semibold tracking-tight text-white">
            Social Web
          </p>
          <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
            {isSignUp ? "Create your account" : "Sign in to continue"}
          </p>

          <div className="mx-auto mt-8 w-full max-w-sm">
            <p className="section-title">{isSignUp ? "Create account" : "Welcome back"}</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              {isSignUp ? "Start your circle." : "Sign in to your feed."}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              {isSignUp
                ? "Create an account to start posting and sending friend requests."
                : "Use your email and password to continue."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {isSignUp ? (
                <input className="app-input" name="name" placeholder="Full name" required />
              ) : null}
              <input
                className="app-input"
                name="email"
                type="email"
                placeholder="Email"
                required
              />
              <input
                className="app-input"
                name="password"
                type="password"
                placeholder="Password"
                required
                minLength={isSignUp ? 8 : undefined}
              />

              {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}

              <button
                type="submit"
                className="app-button app-button-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingSpinner size="sm" className="border-t-[#1f1302]" /> : null}
                {isSubmitting
                  ? isSignUp
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignUp
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
              <LoadingLink
                href={isSignUp ? "/sign-in" : "/sign-up"}
                className="font-semibold text-[var(--accent-yellow)]"
                loadingMessage={isSignUp ? "Opening sign in..." : "Opening sign up..."}
              >
                {isSignUp ? "Sign in" : "Create one"}
              </LoadingLink>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
