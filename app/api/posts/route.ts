import { auth } from "@/lib/auth";
import { isAllowedImageUrl } from "@/lib/imagekit";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    content?: string;
    imageUrl?: string | null;
  };

  const content = body.content?.trim() ?? "";
  const imageUrl = body.imageUrl?.trim() || null;

  if (!content && !imageUrl) {
    return Response.json(
      { error: "A post needs text or an image." },
      { status: 400 },
    );
  }

  if (content.length > 500) {
    return Response.json(
      { error: "Post text must be 500 characters or fewer." },
      { status: 400 },
    );
  }

  if (imageUrl && !isAllowedImageUrl(imageUrl)) {
    return Response.json({ error: "Invalid image URL." }, { status: 400 });
  }

  await prisma.post.create({
    data: {
      authorId: session.user.id,
      content,
      imageUrl,
    },
  });

  return Response.json({ ok: true });
}
