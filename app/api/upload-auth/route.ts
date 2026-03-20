import { auth } from "@/lib/auth";
import { getImageKitConfig } from "@/lib/imagekit";
import { getUploadAuthParams } from "@imagekit/next/server";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { publicKey, privateKey } = getImageKitConfig();
  const { token, expire, signature } = getUploadAuthParams({
    publicKey,
    privateKey,
  });

  return Response.json({
    token,
    expire,
    signature,
    publicKey,
  });
}
