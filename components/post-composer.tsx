"use client";

import { LoadingSpinner } from "@/components/loading-spinner";
import { usePageLoading } from "@/components/page-loading-provider";
import {
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type UploadAuthResponse = {
  signature: string;
  expire: number;
  token: string;
  publicKey: string;
};

export function PostComposer() {
  const router = useRouter();
  const { startLoading } = usePageLoading();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function resetPreview(nextFile: File | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;

    setFile(nextFile);
    setError(null);
    setUploadProgress(0);
    resetPreview(nextFile);
  }

  async function getUploadAuth() {
    const response = await fetch("/api/upload-auth");
    const json = (await response.json()) as UploadAuthResponse & { error?: string };

    if (!response.ok) {
      throw new Error(json.error || "Unable to authorize upload.");
    }

    return json;
  }

  async function uploadToImageKit(selectedFile: File) {
    const authParams = await getUploadAuth();
    const controller = new AbortController();

    abortControllerRef.current = controller;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await upload({
        file: selectedFile,
        fileName: selectedFile.name,
        folder: "/social-web/posts",
        useUniqueFileName: true,
        token: authParams.token,
        expire: authParams.expire,
        signature: authParams.signature,
        publicKey: authParams.publicKey,
        abortSignal: controller.signal,
        onProgress: (event) => {
          if (!event.total) {
            return;
          }

          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      if (!result.url) {
        throw new Error("Upload completed without a file URL.");
      }

      return result.url;
    } catch (uploadError) {
      if (uploadError instanceof ImageKitInvalidRequestError) {
        throw new Error(uploadError.message || "ImageKit rejected the upload request.");
      }

      if (uploadError instanceof ImageKitUploadNetworkError) {
        throw new Error("Upload failed due to a network issue.");
      }

      if (uploadError instanceof ImageKitServerError) {
        throw new Error("ImageKit returned a server error during upload.");
      }

      throw uploadError;
    } finally {
      abortControllerRef.current = null;
      setIsUploading(false);
    }
  }

  async function handleSubmit() {
    if (!content.trim() && !file) {
      setError("Add text or choose a photo before posting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const stopLoading = startLoading(file ? "Uploading and sharing your post..." : "Sharing your post...");

    try {
      let imageUrl: string | null = null;

      if (file) {
        imageUrl = await uploadToImageKit(file);
      }

      const postResponse = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          imageUrl,
        }),
      });

      const postJson = (await postResponse.json()) as { error?: string };

      if (!postResponse.ok) {
        throw new Error(postJson.error || "Unable to publish post.");
      }

      setContent("");
      setFile(null);
      setUploadProgress(0);
      resetPreview(null);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Something went wrong.",
      );
    } finally {
      stopLoading();
      setIsSubmitting(false);
    }
  }

  const buttonLabel = isSubmitting
    ? isUploading
      ? `Uploading ${uploadProgress}%`
      : "Sharing..."
    : "Share";

  return (
    <section className="feed-card rounded-[1.35rem] p-4 md:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Create post</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Share a thought or a photo with friends.
          </p>
        </div>
        <span className="status-pill status-pill-accepted">Feed</span>
      </div>

      <textarea
        className="app-input app-textarea mt-4"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="What's happening?"
        maxLength={500}
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="app-button app-button-ghost">
          <span>{file ? "Change photo" : "Add photo"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          className="app-button app-button-primary min-w-36"
          disabled={isSubmitting}
        >
          {isSubmitting ? <LoadingSpinner size="sm" className="border-t-[#1f1302]" /> : null}
          {buttonLabel}
        </button>
      </div>

      {isUploading ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Uploading to ImageKit</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-blue),var(--accent-yellow),var(--accent-orange))] transition-[width] duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      {previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-[1rem] border border-white/8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Selected preview"
            className="h-72 w-full object-cover"
          />
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-[var(--error)]">{error}</p> : null}
    </section>
  );
}
