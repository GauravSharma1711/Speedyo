-- CreateTable
CREATE TABLE "vehicle_likes" (
    "user_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_likes_pkey" PRIMARY KEY ("user_id","vehicle_id")
);

-- CreateTable
CREATE TABLE "vehicle_saves" (
    "user_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_saves_pkey" PRIMARY KEY ("user_id","vehicle_id")
);

-- CreateIndex
CREATE INDEX "vehicle_likes_vehicle_id_idx" ON "vehicle_likes"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_saves_vehicle_id_idx" ON "vehicle_saves"("vehicle_id");

-- AddForeignKey
ALTER TABLE "vehicle_likes" ADD CONSTRAINT "vehicle_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_likes" ADD CONSTRAINT "vehicle_likes_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_saves" ADD CONSTRAINT "vehicle_saves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_saves" ADD CONSTRAINT "vehicle_saves_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN "shares" INTEGER NOT NULL DEFAULT 0;
