-- DropIndex
DROP INDEX "messages_conversation_id_idx";

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "last_message" TEXT,
    "last_message_at" TIMESTAMP(3),
    "last_message_type" "MessageType" NOT NULL DEFAULT 'general',
    "user1_unread" INTEGER NOT NULL DEFAULT 0,
    "user2_unread" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversations_user1_id_idx" ON "conversations"("user1_id");

-- CreateIndex
CREATE INDEX "conversations_user2_id_idx" ON "conversations"("user2_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_user1_id_user2_id_vehicle_id_key" ON "conversations"("user1_id", "user2_id", "vehicle_id");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
