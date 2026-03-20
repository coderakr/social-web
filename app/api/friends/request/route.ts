import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getFriendPairKey } from "@/lib/social";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    userId?: string;
  };

  const targetUserId = body.userId?.trim();

  if (!targetUserId) {
    return Response.json({ error: "User is required." }, { status: 400 });
  }

  if (targetUserId === session.user.id) {
    return Response.json(
      { error: "You cannot send a request to yourself." },
      { status: 400 },
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: targetUserId,
    },
    select: {
      id: true,
    },
  });

  if (!targetUser) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  const pairKey = getFriendPairKey(session.user.id, targetUserId);
  const existingFriendship = await prisma.friendship.findUnique({
    where: {
      pairKey,
    },
  });

  if (!existingFriendship) {
    await prisma.friendship.create({
      data: {
        requesterId: session.user.id,
        addresseeId: targetUserId,
        pairKey,
        status: "PENDING",
      },
    });

    return Response.json({ ok: true });
  }

  if (existingFriendship.status === "ACCEPTED") {
    return Response.json(
      { error: "You are already friends." },
      { status: 400 },
    );
  }

  if (existingFriendship.status === "PENDING") {
    return Response.json(
      { error: "A friend request already exists." },
      { status: 400 },
    );
  }

  await prisma.friendship.update({
    where: {
      id: existingFriendship.id,
    },
    data: {
      requesterId: session.user.id,
      addresseeId: targetUserId,
      status: "PENDING",
    },
  });

  return Response.json({ ok: true });
}
