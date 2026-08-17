-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "readTimeMinutes" INTEGER NOT NULL,
    "prompt" TEXT,
    "introductionText" TEXT,
    "imageUrl" TEXT,
    "imageTitle" TEXT,
    "imageBackground" TEXT,
    "imageTextColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_date_idx" ON "blog_posts"("date");
