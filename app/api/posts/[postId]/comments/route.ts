import { auth } from "@/lib/auth";
import { canUserViewAuthorPosts } from "@/lib/post-visibility";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

async function getAuthorizedPost(request: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return { error: Response.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  const { postId } = await context.params;
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
    return { error: Response.json({ error: "Post not found." }, { status: 404 }) };
  }

  const canViewPost = await canUserViewAuthorPosts(session.user.id, post.authorId);

  if (!canViewPost) {
    return { error: Response.json({ error: "Forbidden." }, { status: 403 }) };
  }

  return { session, post };
}

export async function GET(request: Request, context: RouteContext) {
  const result = await getAuthorizedPost(request, context);

  if ("error" in result) {
    return result.error;
  }

  const comments = await prisma.comment.findMany({
    where: {
      postId: result.post.id,
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
      createdAt: "asc",
    },
  });

  return Response.json({ comments });
}

export async function POST(request: Request, context: RouteContext) {
  const result = await getAuthorizedPost(request, context);

  if ("error" in result) {
    return result.error;
  }

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

  await prisma.comment.create({
    data: {
      postId: result.post.id,
      authorId: result.session.user.id,
      content,
    },
  });

  return Response.json({ ok: true });
}
