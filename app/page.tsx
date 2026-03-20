import { getServerSession } from "@/lib/session";
import { LoadingLink } from "@/components/loading-link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="shell">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-12 md:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="brand-mark text-xl font-semibold">Social Web</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              A dark social feed with an Instagram-style rhythm.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-muted)] md:text-lg">
              Share text, upload photos, add friends, and keep the timeline limited to accepted
              connections.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LoadingLink
                href="/sign-up"
                className="app-button app-button-primary"
                loadingMessage="Opening sign up..."
              >
                Create account
              </LoadingLink>
              <LoadingLink
                href="/sign-in"
                className="app-button app-button-ghost"
                loadingMessage="Opening sign in..."
              >
                Sign in
              </LoadingLink>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[420px]">
            <div className="feed-card overflow-hidden rounded-[2rem]">
              <div className="flex items-center gap-2 border-b border-white/6 px-5 py-4">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-orange)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-yellow)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-blue)]" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="avatar-chip">SW</div>
                  <div>
                    <p className="text-sm font-semibold text-white">socialweb</p>
                    <p className="text-xs text-[var(--text-muted)]">Friends-only post</p>
                  </div>
                </div>
              </div>
              <div className="aspect-[4/5] bg-[linear-gradient(160deg,rgba(104,173,255,0.18),rgba(247,188,85,0.18))]" />
              <div className="space-y-3 p-5">
                <div className="flex gap-2">
                  <span className="status-pill status-pill-accepted">Posts</span>
                  <span className="status-pill status-pill-pending">Friends</span>
                </div>
                <p className="text-sm leading-7 text-[#e5edf8]">
                  <span className="mr-2 font-semibold text-white">socialweb</span>
                  Clean feed cards, dark UI, photo-first layout, and simple friend management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
