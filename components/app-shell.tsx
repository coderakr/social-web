"use client";

import { LoadingLink } from "@/components/loading-link";
import { SignOutButton } from "@/components/sign-out-button";
import { getInitials } from "@/lib/social";
import { useState } from "react";

type AppShellProps = {
  active: "home" | "create" | "network" | "profile";
  title: string;
  subtitle: string;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  children: React.ReactNode;
};

const navItems = [
  {
    key: "home",
    href: "/home",
    label: "Home",
    description: "Latest posts",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 9.5V20h13V9.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "create",
    href: "/create",
    label: "Create",
    description: "New post",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "network",
    href: "/network",
    label: "Friends",
    description: "Your circle",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 21v-1.5A3.5 3.5 0 0 0 12.5 16H7.5A3.5 3.5 0 0 0 4 19.5V21" strokeLinecap="round" />
        <circle cx="10" cy="9" r="3.5" />
        <path d="M20 21v-1a3 3 0 0 0-2.2-2.9" strokeLinecap="round" />
        <path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "profile",
    href: "/profile",
    label: "Profile",
    description: "Your details",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

export function AppShell({
  active,
  title,
  subtitle,
  user,
  children,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  const avatarContent = user.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.image}
      alt={user.name}
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    getInitials(user.name)
  );

  return (
    <main className="shell min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        {isSidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-30 bg-[rgba(6,10,17,0.62)] backdrop-blur-sm lg:hidden"
            onClick={closeSidebar}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[288px] flex-col overflow-y-auto overscroll-contain border-r border-white/6 bg-[linear-gradient(180deg,rgba(7,12,20,0.98),rgba(10,16,26,0.98))] px-4 py-4 pb-6 backdrop-blur-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 lg:px-5 lg:py-5 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <LoadingLink
              href="/home"
              className="flex items-center gap-3 rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-3 py-3"
              onClick={closeSidebar}
              loadingMessage="Opening home..."
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.15rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] text-sm font-bold text-white">
                SW
              </div>
              <div>
                <p className="brand-mark text-lg font-semibold tracking-tight">Social Web</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Private circle
                </p>
              </div>
            </LoadingLink>
            <button
              type="button"
              className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-white lg:hidden"
              onClick={closeSidebar}
            >
              Close
            </button>
          </div>

          <div className="mt-4 rounded-[1.55rem] border border-[rgba(104,173,255,0.12)] bg-[linear-gradient(160deg,rgba(18,28,43,0.96),rgba(10,16,27,0.96))] p-4">
            <div className="flex items-center gap-3">
              <div className="avatar-chip shrink-0 overflow-hidden">{avatarContent}</div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">{user.name}</p>
                <p className="truncate text-sm text-[var(--accent-blue)]">{user.email}</p>
              </div>
            </div>

            <LoadingLink
              href="/create"
              className="app-button app-button-primary mt-4 w-full rounded-[1rem]"
              onClick={closeSidebar}
              loadingMessage="Opening create post..."
            >
              New post
            </LoadingLink>
          </div>

          <div className="mt-5 px-1">
            <p className="section-title">Navigate</p>
          </div>

          <nav className="mt-3 flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = item.key === active;

              return (
                <LoadingLink
                  key={item.key}
                  href={item.href}
                  onClick={closeSidebar}
                  loadingMessage={`Opening ${item.label.toLowerCase()}...`}
                  className={`group rounded-[1.2rem] border px-4 py-3 transition-colors ${
                    isActive
                      ? "border-[rgba(104,173,255,0.22)] bg-[linear-gradient(135deg,rgba(104,173,255,0.18),rgba(32,52,80,0.3))] text-white shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
                      : "border-white/7 bg-white/[0.02] text-[var(--text-muted)] hover:border-white/12 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-[0.95rem] border ${
                        isActive
                          ? "border-white/10 bg-white/[0.08]"
                          : "border-white/6 bg-white/[0.03]"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-[var(--text-muted)] transition-colors group-hover:text-[#c7d3e5]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </LoadingLink>
              );
            })}
          </nav>

          <div className="mt-auto pt-5">
            <SignOutButton />
          </div>
        </aside>

        <section className="min-w-0 flex-1 lg:pl-0">
          <header className="sticky top-0 z-20 border-b border-white/6 bg-[#0a111b]/88 px-4 py-3 backdrop-blur-xl md:px-6 md:py-3.5 lg:border-b-0 lg:bg-transparent lg:px-8 lg:pt-5 lg:pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open sidebar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-white lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <span className="flex flex-col gap-1">
                  <span className="block h-0.5 w-4 bg-white" />
                  <span className="block h-0.5 w-4 bg-white" />
                  <span className="block h-0.5 w-4 bg-white" />
                </span>
              </button>
              <div className="min-w-0">
                <p className="section-title">Workspace</p>
                <h1 className="mt-1 text-[1.65rem] font-semibold tracking-tight text-white md:text-3xl">
                  {title}
                </h1>
                <p className="mt-1 hidden max-w-2xl text-sm leading-6 text-[var(--text-muted)] md:block md:text-base">
                  {subtitle}
                </p>
              </div>
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Signed in as
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">{user.name}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
