import { AppShell } from "@/components/app-shell";
import { DeletePostButton } from "@/components/delete-post-button";
import prisma from "@/lib/prisma";
import { formatPostDate, getInitials } from "@/lib/social";
import { requireServerSession } from "@/lib/session";

export default async function HomePage() {
  const session = await requireServerSession();
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: session.user.id }, { addresseeId: session.user.id }],
    },
    select: {
      requesterId: true,
      addresseeId: true,
    },
  });

  const visibleAuthorIds = [
    session.user.id,
    ...friendships.map((friendship) =>
      friendship.requesterId === session.user.id ? friendship.addresseeId : friendship.requesterId,
    ),
  ];
  const acceptedFriendCount = visibleAuthorIds.length - 1;

  const posts = await prisma.post.findMany({
    where: {
      authorId: {
        in: visibleAuthorIds,
      },
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
      active="home"
      title="Home"
      subtitle="A cleaner feed for your updates and the people you added."
      user={session.user}
    >
      <section className="mx-auto w-full max-w-[760px] space-y-5 md:space-y-6">
        <div className="overflow-hidden rounded-[1.6rem] border border-white/8 bg-[linear-gradient(135deg,rgba(17,24,39,0.96),rgba(10,17,27,0.98))] shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          <div className="border-b border-white/7 px-5 py-5 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-blue)]">
                  Your circle
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
                  Posts from people you know
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)] md:text-[0.95rem]">
                  Your home feed shows your posts first-hand and accepted friends in the same
                  timeline, ordered by the latest activity.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-full border border-[rgba(247,188,85,0.18)] bg-[rgba(247,188,85,0.08)] px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#ffd18a]">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent-yellow)]" />
                Friends-only feed
              </div>
            </div>
          </div>

          <div className="grid gap-3 px-5 py-4 sm:grid-cols-3 md:px-6">
            <div className="rounded-[1.15rem] border border-white/7 bg-white/[0.03] px-4 py-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Visible posts
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{posts.length}</p>
            </div>
            <div className="rounded-[1.15rem] border border-white/7 bg-white/[0.03] px-4 py-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Friends in feed
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {acceptedFriendCount}
              </p>
            </div>
            <div className="rounded-[1.15rem] border border-white/7 bg-white/[0.03] px-4 py-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Feed scope
              </p>
              <p className="mt-2 text-base font-semibold tracking-tight text-white">
                You + accepted friends
              </p>
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="feed-card rounded-[1.35rem] p-6">
            <div className="empty-state rounded-[1rem] p-6 text-sm leading-7 text-[var(--text-muted)]">
              No posts are visible yet. Share your first update or add friends to see their posts
              here.
            </div>
          </div>
        ) : (
          posts.map((post) => {
            const isOwnPost = post.authorId === session.user.id;
            const audienceLabel = isOwnPost ? "Your post" : "Friend update";

            return (
              <article
                key={post.id}
                className="overflow-hidden rounded-[1.45rem] border border-white/8 bg-[linear-gradient(180deg,rgba(14,20,31,0.98),rgba(11,16,25,0.98))] shadow-[0_14px_36px_rgba(0,0,0,0.18)]"
              >
                <div className="border-b border-white/7 px-4 py-4 md:px-5">
                  <div className="flex items-start gap-3">
                    <div className="avatar-chip mt-0.5 shrink-0">{getInitials(post.author.name)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-[0.98rem] font-semibold text-white">
                            {post.author.name}
                          </p>
                          <p className="truncate text-xs text-[var(--text-muted)]">
                            {post.author.email}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] ${
                              isOwnPost
                                ? "bg-[rgba(247,188,85,0.12)] text-[#ffd18a]"
                                : "bg-[rgba(104,173,255,0.14)] text-[#b9d9ff]"
                            }`}
                          >
                            {audienceLabel}
                          </span>
                          <span className="text-[11px] leading-5 text-[var(--text-muted)]">
                            {formatPostDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {post.imageUrl ? (
                  <div className="px-4 pt-4 md:px-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt={`Post by ${post.author.name}`}
                      className="max-h-[42rem] w-full rounded-[1.1rem] border border-white/7 object-cover"
                    />
                  </div>
                ) : null}

                <div className="px-4 py-4 md:px-5 md:py-5">
                  {post.content ? (
                    <p className="whitespace-pre-wrap text-[0.95rem] leading-7 text-[#e6edf8]">
                      <span className="mr-2 font-semibold text-white">{post.author.name}</span>
                      {post.content}
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">Shared a photo.</p>
                  )}

                  <div className="mt-4 flex justify-end">
                    {isOwnPost ? <DeletePostButton postId={post.id} /> : null}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </AppShell>
  );
}
