-- CreateTable
CREATE TABLE "post_reaction" (
    "id" TEXT NOT NULL,
    "type" "reaction_type" NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_reaction_slug_idx" ON "post_reaction"("slug");

-- CreateIndex
CREATE INDEX "post_reaction_userId_idx" ON "post_reaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "post_reaction_userId_slug_type_key" ON "post_reaction"("userId", "slug", "type");

-- AddForeignKey
ALTER TABLE "post_reaction" ADD CONSTRAINT "post_reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
