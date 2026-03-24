import { AppShell } from "@/components/app-shell";
import { DeletePostButton } from "@/components/delete-post-button";
import { PostReactionButtons } from "@/components/post-reaction-buttons";
import { ProfileEditor } from "@/components/profile-editor";
import { getPostReactionSummary } from "@/lib/post-reactions";
import prisma from "@/lib/prisma";
import { formatPostDate, getInitials } from "@/lib/social";
import { requireServerSession } from "@/lib/session";

export default async function ProfilePage() {
  const session = await requireServerSession();

  const [user, posts, acceptedFriendCount, commentCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    }),
    prisma.post.findMany({
      where: {
        authorId: session.user.id,
      },
      include: {
        comments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.friendship.count({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: session.user.id }, { addresseeId: session.user.id }],
      },
    }),
    prisma.comment.count({
      where: {
        authorId: session.user.id,
      },
    }),
  ]);
  const reactionSummary = await getPostReactionSummary(
    posts.map((post) => post.id),
    session.user.id,
  );

  const photoPostCount = posts.filter((post) => Boolean(post.imageUrl)).length;

  return (
    <AppShell
      active="profile"
      title="Profile"
      subtitle="Manage your identity, update your bio, and review everything you have posted."
      user={user}
    >
      <div className="mx-auto w-full max-w-[980px] space-y-5 md:space-y-6">
        <ProfileEditor user={user} />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-5 py-4">
            <p className="section-title">Posts</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{posts.length}</p>
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-5 py-4">
            <p className="section-title">Photo Posts</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{photoPostCount}</p>
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-5 py-4">
            <p className="section-title">Friends</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {acceptedFriendCount}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-5 py-4">
            <p className="section-title">Comments</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{commentCount}</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="section-title">Your posts</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Everything you have shared
              </h2>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(13,19,30,0.98),rgba(10,15,24,0.98))] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
              <div className="empty-state rounded-[1.2rem] p-6 text-sm leading-7 text-[var(--text-muted)]">
                You have not shared anything yet. Create a post to start building your profile.
              </div>
            </div>
          ) : (
            posts.map((post) => {
              const postReaction = reactionSummary.get(post.id) ?? {
                likes: 0,
                dislikes: 0,
                currentReaction: null,
              };

              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(13,20,32,0.98),rgba(10,15,24,0.98))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] md:p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="avatar-chip mt-0.5 shrink-0 overflow-hidden">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          getInitials(user.name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-white">{user.name}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{user.email}</p>
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
                        alt={`Post by ${user.name}`}
                        className="max-h-[44rem] w-full rounded-[1.35rem] border border-white/7 object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-[var(--text-muted)]">
                      {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
                    </p>
                    <div className="flex items-center gap-2">
                      <PostReactionButtons
                        postId={post.id}
                        initialLikes={postReaction.likes}
                        initialDislikes={postReaction.dislikes}
                        initialReaction={postReaction.currentReaction}
                      />
                      <DeletePostButton postId={post.id} />
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </AppShell>
  );
}
