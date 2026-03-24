import prisma from "@/lib/prisma";
import { ReactionKind } from "@prisma/client";

export type PostReactionSummary = {
  likes: number;
  dislikes: number;
  currentReaction: ReactionKind | null;
};

export async function getPostReactionSummary(postIds: string[], userId: string) {
  if (postIds.length === 0) {
    return new Map<string, PostReactionSummary>();
  }

  const [counts, viewerReactions] = await Promise.all([
    prisma.postReaction.groupBy({
      by: ["postId", "kind"],
      where: {
        postId: {
          in: postIds,
        },
      },
      _count: {
        _all: true,
      },
    }),
    prisma.postReaction.findMany({
      where: {
        postId: {
          in: postIds,
        },
        authorId: userId,
      },
      select: {
        postId: true,
        kind: true,
      },
    }),
  ]);

  const summary = new Map<string, PostReactionSummary>();

  for (const postId of postIds) {
    summary.set(postId, {
      likes: 0,
      dislikes: 0,
      currentReaction: null,
    });
  }

  for (const item of counts) {
    const existing = summary.get(item.postId);

    if (!existing) {
      continue;
    }

    if (item.kind === ReactionKind.LIKE) {
      existing.likes = item._count._all;
    } else {
      existing.dislikes = item._count._all;
    }
  }

  for (const reaction of viewerReactions) {
    const existing = summary.get(reaction.postId);

    if (!existing) {
      continue;
    }

    existing.currentReaction = reaction.kind;
  }

  return summary;
}
