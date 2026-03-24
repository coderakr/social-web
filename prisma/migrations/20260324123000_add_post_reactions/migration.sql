-- CreateEnum
CREATE TYPE "ReactionKind" AS ENUM ('LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "PostReaction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "kind" "ReactionKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_postId_authorId_key" ON "PostReaction"("postId", "authorId");

-- CreateIndex
CREATE INDEX "PostReaction_postId_kind_idx" ON "PostReaction"("postId", "kind");

-- CreateIndex
CREATE INDEX "PostReaction_authorId_createdAt_idx" ON "PostReaction"("authorId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
