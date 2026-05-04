import type { PrismaClient } from "@/lib/generated/prisma/client";
import type { MessageType } from "@/lib/generated/prisma/enums";

type Db = Pick<PrismaClient, "conversation">;

/**
 * Finds a conversation for the two users + vehicle in either user1/user2 order
 * (legacy rows may not use lexicographically sorted ids), updates it, or
 * creates a new row with sorted user ids.
 */
export async function upsertVehicleConversation(
  db: Db,
  args: {
    userAId: string;
    userBId: string;
    vehicleId: string;
    recipientUnreadForUserId: string;
    last_message: string;
    last_message_at: Date;
    last_message_type: MessageType;
  },
) {
  const { userAId, userBId, vehicleId, recipientUnreadForUserId, last_message, last_message_at, last_message_type } =
    args;

  const existing = await db.conversation.findFirst({
    where: {
      vehicleId,
      OR: [
        { user1Id: userAId, user2Id: userBId },
        { user1Id: userBId, user2Id: userAId },
      ],
    },
  });

  if (existing) {
    return db.conversation.update({
      where: { id: existing.id },
      data: {
        last_message,
        last_message_at,
        last_message_type,
        ...(recipientUnreadForUserId === existing.user1Id
          ? { user1_unread: { increment: 1 } }
          : { user2_unread: { increment: 1 } }),
      },
    });
  }

  const [user1Id, user2Id] = [userAId, userBId].sort();
  return db.conversation.create({
    data: {
      user1Id,
      user2Id,
      vehicleId,
      last_message,
      last_message_at,
      last_message_type,
      user1_unread: recipientUnreadForUserId === user1Id ? 1 : 0,
      user2_unread: recipientUnreadForUserId === user2Id ? 1 : 0,
    },
  });
}
