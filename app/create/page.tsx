import { AppShell } from "@/components/app-shell";
import { PostComposer } from "@/components/post-composer";
import { requireServerSession } from "@/lib/session";

export default async function CreatePostPage() {
  const session = await requireServerSession();

  return (
    <AppShell
      active="create"
      title="Create Post"
      subtitle="Write an update, attach a photo, and share it with your accepted friends."
      user={session.user}
    >
      <div className="mx-auto w-full max-w-[720px] space-y-4">
        <PostComposer />
      </div>
    </AppShell>
  );
}
