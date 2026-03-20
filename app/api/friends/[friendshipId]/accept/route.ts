import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    friendshipId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { friendshipId } = await context.params;

  const friendship = await prisma.friendship.findUnique({
    where: {
      id: friendshipId,
    },
  });

  if (!friendship) {
    return Response.json({ error: "Request not found." }, { status: 404 });
  }

  if (friendship.addresseeId !== session.user.id) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.friendship.update({
    where: {
      id: friendship.id,
    },
    data: {
      status: "ACCEPTED",
    },
  });

  return Response.json({ ok: true });
}
