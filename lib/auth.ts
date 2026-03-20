import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

function getTrustedOrigins() {
  const configuredOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const baseOrigin = process.env.BETTER_AUTH_URL?.trim();

  return Array.from(
    new Set([
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://0.0.0.0:3000",
      ...(baseOrigin ? [baseOrigin] : []),
      ...(configuredOrigins ?? []),
    ]),
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
  },
});
