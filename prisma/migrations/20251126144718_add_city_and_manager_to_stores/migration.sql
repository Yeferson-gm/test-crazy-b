-- AlterTable
ALTER TABLE "products" ADD COLUMN     "image_id" TEXT;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "city" TEXT,
ADD COLUMN     "manager" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profile_image_id" TEXT,
ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "secure_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_public_id_key" ON "media"("public_id");

-- CreateIndex
CREATE INDEX "media_public_id_idx" ON "media"("public_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profile_image_id_fkey" FOREIGN KEY ("profile_image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
