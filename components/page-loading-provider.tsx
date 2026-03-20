"use client";

import { LoadingSpinner } from "@/components/loading-spinner";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";

type PageLoadingContextValue = {
  startLoading: (message?: string) => () => void;
  startNavigationLoading: (message?: string) => void;
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
  const nextIdRef = useRef(0);
  const activeIdsRef = useRef(new Set<number>());
  const navigationStopRef = useRef<null | (() => void)>(null);
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
        navigationStopRef.current?.();
        navigationStopRef.current = startLoading(nextMessage);
      },
    };
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (navigationStopRef.current) {
      navigationStopRef.current();
      navigationStopRef.current = null;
    }
  }, [pathname]);

  const isVisible = activeCount > 0;

  return (
    <PageLoadingContext.Provider value={value}>
      {children}
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
