import { auth } from "@/lib/auth";
import { canUserViewAuthorPosts } from "@/lib/post-visibility";
import prisma from "@/lib/prisma";

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
    content?: string;
  };
  const content = body.content?.trim() ?? "";

  if (!content) {
    return Response.json({ error: "Comment cannot be empty." }, { status: 400 });
  }

  if (content.length > 280) {
    return Response.json(
      { error: "Comment must be 280 characters or fewer." },
      { status: 400 },
    );
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

  await prisma.comment.create({
    data: {
      postId: post.id,
      authorId: session.user.id,
      content,
    },
  });

  return Response.json({ ok: true });
}
