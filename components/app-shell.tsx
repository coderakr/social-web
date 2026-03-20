"use client";

import { LoadingLink } from "@/components/loading-link";
import { SignOutButton } from "@/components/sign-out-button";
import { getInitials } from "@/lib/social";
import { useState } from "react";

type AppShellProps = {
  active: "home" | "create" | "network";
  title: string;
  subtitle: string;
  user: {
    name: string;
    email: string;
  };
  children: React.ReactNode;
};

const navItems = [
  { key: "home", href: "/home", label: "Home" },
  { key: "create", href: "/create", label: "Create Post" },
  { key: "network", href: "/network", label: "Friends" },
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
          className={`fixed inset-y-0 left-0 z-40 w-[280px] overflow-y-auto overscroll-contain border-r border-white/6 bg-[#0a111b]/96 px-5 py-5 pb-8 backdrop-blur-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 lg:py-6 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <LoadingLink
              href="/home"
              className="flex items-center gap-3"
              onClick={closeSidebar}
              loadingMessage="Opening home..."
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-bold text-white">
                SW
              </div>
              <div>
                <p className="brand-mark text-lg font-semibold tracking-tight">Social Web</p>
                <p className="text-[11px] text-[var(--text-muted)]">friends only</p>
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

          <div className="mt-5 rounded-[1.5rem] border border-white/7 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="avatar-chip shrink-0">{getInitials(user.name)}</div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">{user.name}</p>
                <p className="truncate text-sm text-[var(--accent-blue)]">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-white/7 bg-white/[0.03] p-4">
            <p className="section-title">Quick Action</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Share a new update from the dedicated create page.
            </p>
            <LoadingLink
              href="/create"
              className="app-button app-button-primary mt-4 w-full"
              onClick={closeSidebar}
              loadingMessage="Opening create post..."
            >
              Create post
            </LoadingLink>
          </div>

          <nav className="mt-4 flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = item.key === active;

              return (
                <LoadingLink
                  key={item.key}
                  href={item.href}
                  onClick={closeSidebar}
                  loadingMessage={`Opening ${item.label.toLowerCase()}...`}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-[rgba(247,188,85,0.22)] bg-[linear-gradient(135deg,rgba(247,188,85,0.16),rgba(255,151,79,0.12))] text-white"
                      : "border-white/7 bg-white/[0.02] text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {item.label}
                </LoadingLink>
              );
            })}
          </nav>

          <div className="mt-4">
            <SignOutButton />
          </div>
        </aside>

        <section className="min-w-0 flex-1 lg:pl-0">
          <header className="sticky top-0 z-20 border-b border-white/6 bg-[#0a111b]/88 px-4 py-3 backdrop-blur-xl md:px-6 md:py-3.5 lg:border-b-0 lg:bg-transparent lg:px-8 lg:pt-5 lg:pb-2">
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
          </header>

          <div className="px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
