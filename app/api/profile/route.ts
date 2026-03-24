import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    bio?: string | null;
    image?: string | null;
  };

  const name = body.name?.trim() ?? "";
  const bio = body.bio?.trim() ?? "";
  const image = body.image?.trim() ?? "";

  if (!name) {
    return Response.json({ error: "Name is required." }, { status: 400 });
  }

  if (name.length > 60) {
    return Response.json({ error: "Name must be 60 characters or fewer." }, { status: 400 });
  }

  if (bio.length > 240) {
    return Response.json({ error: "Bio must be 240 characters or fewer." }, { status: 400 });
  }

  if (image) {
    try {
      new URL(image);
    } catch {
      return Response.json({ error: "Avatar must be a valid URL." }, { status: 400 });
    }
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      name,
      bio: bio || null,
      image: image || null,
    },
  });

  return Response.json({ ok: true });
}
