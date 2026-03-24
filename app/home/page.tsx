import { AppShell } from "@/components/app-shell";
import { CommentsSection } from "@/components/comments-section";
import { DeletePostButton } from "@/components/delete-post-button";
import { LoadingLink } from "@/components/loading-link";
import { getPostReactionSummary } from "@/lib/post-reactions";
import { getVisibleAuthorIds } from "@/lib/post-visibility";
import prisma from "@/lib/prisma";
import { formatPostDate, getInitials } from "@/lib/social";
import { requireServerSession } from "@/lib/session";
import { PostReactionButtons } from "@/components/post-reaction-buttons";

export default async function HomePage() {
  const session = await requireServerSession();
  const visibleAuthorIds = await getVisibleAuthorIds(session.user.id);

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
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const reactionSummary = await getPostReactionSummary(
    posts.map((post) => post.id),
    session.user.id,
  );
  return (
    <AppShell
      active="home"
      title="Home"
      subtitle="Posts from you and your accepted friends, ordered by the latest activity."
      user={session.user}
    >
      <section className="mx-auto w-full max-w-[860px]">
        <div className="space-y-4 md:space-y-5">
            {posts.length === 0 ? (
              <div className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(13,19,30,0.98),rgba(10,15,24,0.98))] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
                <div className="empty-state rounded-[1.2rem] p-6 text-sm leading-7 text-[var(--text-muted)]">
                  No posts are visible yet. Share your first update or add friends to see their
                  posts here.
                </div>
              </div>
            ) : (
              posts.map((post, index) => {
                const isOwnPost = post.authorId === session.user.id;
                const postReaction = reactionSummary.get(post.id) ?? {
                  likes: 0,
                  dislikes: 0,
                  currentReaction: null,
                };

                return (
                  <article
                    key={post.id}
                    className="relative overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(13,20,32,0.98),rgba(10,15,24,0.98))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] md:p-5"
                  >
                    <div
                      className={`absolute top-0 left-0 h-full w-1.5 ${
                        isOwnPost ? "bg-[var(--accent-yellow)]" : "bg-[var(--accent-blue)]"
                      }`}
                    />

                    <div className="pl-3 md:pl-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                          <LoadingLink
                            href={isOwnPost ? "/profile" : `/profile/${post.author.id}`}
                            loadingMessage={`Opening ${post.author.name.toLowerCase()}'s profile...`}
                            className="avatar-chip mt-0.5 shrink-0"
                          >
                            {getInitials(post.author.name)}
                          </LoadingLink>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <LoadingLink
                                href={isOwnPost ? "/profile" : `/profile/${post.author.id}`}
                                loadingMessage={`Opening ${post.author.name.toLowerCase()}'s profile...`}
                                className="text-base font-semibold text-white transition-colors hover:text-[var(--accent-blue)]"
                              >
                                {post.author.name}
                              </LoadingLink>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] ${
                                  isOwnPost
                                    ? "bg-[rgba(247,188,85,0.14)] text-[#ffd18a]"
                                    : "bg-[rgba(104,173,255,0.14)] text-[#bddcff]"
                                }`}
                              >
                                {isOwnPost ? "You" : "Friend"}
                              </span>
                              {index === 0 ? (
                                <span className="inline-flex rounded-full bg-[rgba(87,215,162,0.14)] px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#9ceec8]">
                                  Latest
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">{post.author.email}</p>
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            Posted
                          </p>
                          <p className="mt-1 text-sm text-white">{formatPostDate(post.createdAt)}</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1.35rem] bg-white/[0.03] p-4 md:p-5">
                        {post.content ? (
                          <p className="whitespace-pre-wrap text-[0.97rem] leading-7 text-[#e6edf8]">
                            {post.content}
                          </p>
                        ) : (
                          <p className="text-sm uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            Photo post
                          </p>
                        )}
                      </div>

                      {post.imageUrl ? (
                        <div className="mt-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.imageUrl}
                            alt={`Post by ${post.author.name}`}
                            className="max-h-[44rem] w-full rounded-[1.35rem] border border-white/7 object-cover"
                          />
                        </div>
                      ) : null}

                      <div className="mt-4">
                        <CommentsSection
                          postId={post.id}
                          currentUserId={session.user.id}
                          initialCommentCount={post._count.comments}
                          action={
                            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                              <PostReactionButtons
                                postId={post.id}
                                initialLikes={postReaction.likes}
                                initialDislikes={postReaction.dislikes}
                                initialReaction={postReaction.currentReaction}
                              />
                              {isOwnPost ? <DeletePostButton postId={post.id} /> : null}
                            </div>
                          }
                        />
                      </div>
                    </div>
                  </article>
                );
              })
            )}
        </div>
      </section>
    </AppShell>
  );
}
