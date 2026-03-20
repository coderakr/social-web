import { AppShell } from "@/components/app-shell";
import { DeletePostButton } from "@/components/delete-post-button";
import prisma from "@/lib/prisma";
import { formatPostDate, getInitials } from "@/lib/social";
import { requireServerSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await requireServerSession();

  const posts = await prisma.post.findMany({
    where: {
      authorId: session.user.id,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AppShell
      active="dashboard"
      title="Dashboard"
      subtitle="Browse the posts you have shared."
      user={session.user}
    >
      <section className="mx-auto w-full max-w-[720px] space-y-4 md:space-y-5">
        {posts.length === 0 ? (
          <div className="feed-card rounded-[1.35rem] p-6">
            <div className="empty-state rounded-[1rem] p-6 text-sm leading-7 text-[var(--text-muted)]">
              You have not posted anything yet. Use Create Post from the left sidebar to publish your first update.
            </div>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="feed-card overflow-hidden rounded-[1.35rem]">
              <div className="flex items-center gap-3 px-4 py-4">
                <div className="avatar-chip shrink-0">{getInitials(post.author.name)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{post.author.name}</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">{post.author.email}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-right text-[11px] leading-5 text-[var(--text-muted)]">
                    {formatPostDate(post.createdAt)}
                  </p>
                  <DeletePostButton postId={post.id} />
                </div>
              </div>

              {post.imageUrl ? (
                <div className="border-y border-white/6 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt={`Post by ${post.author.name}`}
                    className="max-h-[42rem] w-full object-cover"
                  />
                </div>
              ) : null}

              <div className="px-4 py-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent-orange)]" />
                  Your post
                </div>
                {post.content ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#e6edf8]">
                    <span className="mr-2 font-semibold text-white">{post.author.name}</span>
                    {post.content}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">Shared a photo.</p>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </AppShell>
  );
}
