"use client";

import { LoadingSpinner } from "@/components/loading-spinner";
import { usePageLoading } from "@/components/page-loading-provider";
import { getInitials } from "@/lib/social";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileEditorProps = {
  user: {
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
  };
};

export function ProfileEditor({ user }: ProfileEditorProps) {
  const router = useRouter();
  const { startLoading } = usePageLoading();
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    const stopLoading = startLoading("Updating your profile...");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          image,
          bio,
        }),
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(json.error || "Unable to update profile.");
      }

      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Something went wrong.");
    } finally {
      stopLoading();
      setIsSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(13,20,32,0.98),rgba(10,15,24,0.98))] shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
      <div className="border-b border-white/7 px-5 py-5 md:px-6">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-blue)]">
          Profile
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Your public card</h2>
      </div>

      <div className="grid gap-6 px-5 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:px-6">
        <div className="rounded-[1.4rem] border border-white/7 bg-white/[0.03] p-5">
          <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[linear-gradient(135deg,rgba(104,173,255,0.22),rgba(247,188,85,0.2))] text-2xl font-semibold text-white">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name} className="h-full w-full object-cover" />
            ) : (
              getInitials(name)
            )}
          </div>

          <p className="mt-4 text-center text-lg font-semibold text-white">{name}</p>
          <p className="mt-1 text-center text-sm text-[var(--text-muted)]">{user.email}</p>
          <p className="mt-4 text-center text-sm leading-7 text-[#d7e1f0]">
            {bio.trim() || "Add a short bio so friends know who they are looking at."}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="section-title">Name</label>
            <input
              className="app-input mt-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              placeholder="Your name"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="section-title">Avatar URL</label>
            <input
              className="app-input mt-2"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="https://example.com/avatar.jpg"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="section-title">Bio</label>
            <textarea
              className="app-input app-textarea mt-2"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={240}
              placeholder="Tell your friends a bit about yourself."
              disabled={isSaving}
            />
            <p className="mt-2 text-xs text-[var(--text-muted)]">{bio.trim().length}/240</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            {error ? <p className="text-sm text-[var(--error)]">{error}</p> : <div />}
            <button
              type="button"
              onClick={handleSave}
              className="app-button app-button-primary min-w-32"
              disabled={isSaving}
            >
              {isSaving ? <LoadingSpinner size="sm" className="border-t-[#1f1302]" /> : null}
              {isSaving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
