import type { Metadata } from "next";
import { PageLoadingProvider } from "@/components/page-loading-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Web",
  description: "A dark social feed for sharing posts and keeping up with friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PageLoadingProvider>{children}</PageLoadingProvider>
      </body>
    </html>
  );
}
