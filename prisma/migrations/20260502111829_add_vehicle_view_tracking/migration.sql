-- CreateTable
CREATE TABLE "vehicle_views" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicle_id" TEXT NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "vehicle_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicle_views_vehicle_id_idx" ON "vehicle_views"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_views_user_id_idx" ON "vehicle_views"("user_id");

-- CreateIndex
CREATE INDEX "vehicle_views_created_at_idx" ON "vehicle_views"("created_at");

-- AddForeignKey
ALTER TABLE "vehicle_views" ADD CONSTRAINT "vehicle_views_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_views" ADD CONSTRAINT "vehicle_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
