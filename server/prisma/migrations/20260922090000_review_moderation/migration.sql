CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN');

-- Keep reviews that were published before moderation was introduced visible.
ALTER TABLE "Review" ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "Review" ALTER COLUMN "status" SET DEFAULT 'PENDING';

CREATE INDEX "Review_status_idx" ON "Review"("status");
