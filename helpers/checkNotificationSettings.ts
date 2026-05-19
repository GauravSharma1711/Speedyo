import prisma from "@/db/prisma";

export type NotificationType = "newPost" | "newVehicleListing";

export async function canSendEmailNotification(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  try {
    const settings = await prisma.emailNotifications.findUnique({
      where: { user_id: userId },
    });

    if (!settings) return true;

    if (settings.enabled === false) return false;

    if (type === "newPost" && settings.newPostsFromFollowedUsers === false) {
      return false;
    }

    if (type === "newVehicleListing" && settings.newVehicleListingsFromFollowedUsers === false) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking email notification settings:", error);
    return true;
  }
}

export async function canSendInAppNotification(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  try {
    const settings = await prisma.inAppNotifications.findUnique({
      where: { user_id: userId },
    });

    if (!settings) return true;

    if (settings.enabled === false) return false;

    if (type === "newPost" && settings.newPostsFromFollowedUsers === false) {
      return false;
    }

    if (type === "newVehicleListing" && settings.newVehicleListingsFromFollowedUsers === false) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking in-app notification settings:", error);
    return true;
  }
}