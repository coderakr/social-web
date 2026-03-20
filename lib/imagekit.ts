const imageKitUrlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT?.trim();
const imageKitPublicKey = process.env.IMAGEKIT_PUBLIC_KEY?.trim();
const imageKitPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim();

export function getImageKitConfig() {
  if (!imageKitUrlEndpoint || !imageKitPublicKey || !imageKitPrivateKey) {
    throw new Error("ImageKit environment variables are not configured.");
  }

  return {
    urlEndpoint: imageKitUrlEndpoint.replace(/\/$/, ""),
    publicKey: imageKitPublicKey,
    privateKey: imageKitPrivateKey,
  };
}

export function isAllowedImageUrl(imageUrl: string) {
  try {
    const parsed = new URL(imageUrl);
    const { urlEndpoint } = getImageKitConfig();

    return parsed.href.startsWith(urlEndpoint);
  } catch {
    return imageUrl.startsWith("/uploads/posts/");
  }
}
