-- AlterEnum
ALTER TYPE "PostType" ADD VALUE 'article';

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "article_excerpt" TEXT,
ADD COLUMN     "article_title" TEXT,
ADD COLUMN     "video_thumbnail" TEXT,
ADD COLUMN     "video_url" TEXT;
