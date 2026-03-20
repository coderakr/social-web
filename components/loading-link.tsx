"use client";

import { usePageLoading } from "@/components/page-loading-provider";
import Link, { type LinkProps } from "next/link";
import { MouseEvent, type ReactNode } from "react";

type LoadingLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: ReactNode;
    loadingMessage?: string;
  };

export function LoadingLink({
  children,
  loadingMessage,
  onClick,
  target,
  ...props
}: LoadingLinkProps) {
  const { startNavigationLoading } = usePageLoading();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      target === "_blank" ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    startNavigationLoading(loadingMessage);
  }

  return (
    <Link {...props} target={target} onClick={handleClick}>
      {children}
    </Link>
  );
}
