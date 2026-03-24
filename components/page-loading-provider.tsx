"use client";

import { LoadingSpinner } from "@/components/loading-spinner";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";

type PageLoadingContextValue = {
  startLoading: (message?: string) => () => void;
  startNavigationLoading: (message?: string) => void;
};

type NavigationLoadingState = {
  visible: boolean;
  message: string;
};

const PageLoadingContext = createContext<PageLoadingContextValue | null>(null);

export function PageLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeCount, setActiveCount] = useState(0);
  const [message, setMessage] = useState("Loading...");
  const [navigationLoading, setNavigationLoading] = useState<NavigationLoadingState>({
    visible: false,
    message: "Opening page...",
  });
  const nextIdRef = useRef(0);
  const activeIdsRef = useRef(new Set<number>());
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMountedRef = useRef(false);

  const value = useMemo<PageLoadingContextValue>(() => {
    function startLoading(nextMessage = "Loading...") {
        const id = nextIdRef.current++;
        activeIdsRef.current.add(id);
        flushSync(() => {
          setMessage(nextMessage);
          setActiveCount(activeIdsRef.current.size);
        });

        let finished = false;

        return () => {
          if (finished) {
            return;
          }

          finished = true;
          activeIdsRef.current.delete(id);
          setActiveCount(activeIdsRef.current.size);
        };
      }

    return {
      startLoading,
      startNavigationLoading(nextMessage = "Opening page...") {
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }

        setNavigationLoading({
          visible: false,
          message: nextMessage,
        });

        navigationTimeoutRef.current = setTimeout(() => {
          setNavigationLoading({
            visible: true,
            message: nextMessage,
          });
        }, 120);
      },
    };
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    const resetTimer = setTimeout(() => {
      setNavigationLoading({
        visible: false,
        message: "Opening page...",
      });
    }, 0);

    return () => {
      clearTimeout(resetTimer);
    };
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const isVisible = activeCount > 0;

  return (
    <PageLoadingContext.Provider value={value}>
      {children}
      {navigationLoading.visible ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
          <div className="h-1 w-full overflow-hidden bg-white/6">
            <div className="nav-loading-bar h-full w-1/3 rounded-full bg-[linear-gradient(90deg,var(--accent-blue),var(--accent-yellow),var(--accent-orange))]" />
          </div>
          <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-white/8 bg-[rgba(10,16,26,0.88)] px-3 py-1.5 text-xs text-[var(--text-muted)] shadow-[0_14px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <LoadingSpinner size="sm" />
            <span>{navigationLoading.message}</span>
          </div>
        </div>
      ) : null}
      {isVisible ? (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-[rgba(6,10,17,0.72)] backdrop-blur-md">
          <div className="flex min-w-[220px] flex-col items-center gap-4 rounded-[1.5rem] border border-white/10 bg-[rgba(10,16,26,0.96)] px-8 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.32)]">
            <LoadingSpinner size="lg" />
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Please wait</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{message}</p>
            </div>
          </div>
        </div>
      ) : null}
    </PageLoadingContext.Provider>
  );
}

export function usePageLoading() {
  const context = useContext(PageLoadingContext);

  if (!context) {
    throw new Error("usePageLoading must be used within PageLoadingProvider.");
  }

  return context;
}
