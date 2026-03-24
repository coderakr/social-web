import prisma from "@/lib/prisma";
import { getFriendPairKey } from "@/lib/social";

export async function getVisibleAuthorIds(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: {
      requesterId: true,
      addresseeId: true,
    },
  });

  return [
    userId,
    ...friendships.map((friendship) =>
      friendship.requesterId === userId ? friendship.addresseeId : friendship.requesterId,
    ),
  ];
}

export async function canUserViewAuthorPosts(viewerId: string, authorId: string) {
  if (viewerId === authorId) {
    return true;
  }

  const friendship = await prisma.friendship.findUnique({
    where: {
      pairKey: getFriendPairKey(viewerId, authorId),
    },
    select: {
      status: true,
    },
  });

  return friendship?.status === "ACCEPTED";
}
