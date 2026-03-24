import { auth } from "@/lib/auth";
import { canUserViewAuthorPosts } from "@/lib/post-visibility";
import prisma from "@/lib/prisma";
import { ReactionKind } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { postId } = await context.params;
  const body = (await request.json()) as {
    kind?: ReactionKind | null;
  };
  const kind = body.kind;

  if (kind !== null && kind !== ReactionKind.LIKE && kind !== ReactionKind.DISLIKE) {
    return Response.json({ error: "Invalid reaction." }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!post) {
    return Response.json({ error: "Post not found." }, { status: 404 });
  }

  const canViewPost = await canUserViewAuthorPosts(session.user.id, post.authorId);

  if (!canViewPost) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const existingReaction = await prisma.postReaction.findUnique({
    where: {
      postId_authorId: {
        postId: post.id,
        authorId: session.user.id,
      },
    },
    select: {
      id: true,
      kind: true,
    },
  });

  if (!existingReaction) {
    if (kind) {
      await prisma.postReaction.create({
        data: {
          postId: post.id,
          authorId: session.user.id,
          kind,
        },
      });
    }
  } else if (kind === null) {
    await prisma.postReaction.delete({
      where: {
        id: existingReaction.id,
      },
    });
  } else if (existingReaction.kind !== kind) {
    await prisma.postReaction.update({
      where: {
        id: existingReaction.id,
      },
      data: {
        kind,
      },
    });
  }

  return Response.json({ ok: true });
}
