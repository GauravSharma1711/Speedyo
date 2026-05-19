import { resend } from '../lib/resend'
import NewVehicleListingEmail from '@/mailsTemplates/NewVehicleListingEmail'
import prisma from '@/db/prisma'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const appUrl = process.env.APP_URL || 'https://speedio.app'

export async function sendNewVehicleListingMail(
  followerEmails: { email: string; userId: string }[],
  author_name: string,
  vehicle_id: string,
  vehicle_title: string,
  vehicle_price?: number,
  vehicle_year?: number,
  vehicle_mileage?: number,
  vehicle_location?: string,
) {
  if (followerEmails.length === 0) return { success: true, message: "No followers" };

  try {
    const vehicle_url = `${appUrl}/vehicle?id=${vehicle_id}`

    const filteredFollowers = [];
    for (const follower of followerEmails) {
      const settings = await prisma.emailNotifications.findUnique({
        where: { user_id: follower.userId },
      });

      const canSend = !settings || settings.enabled !== false;
      if (canSend && (settings?.newVehicleListingsFromFollowedUsers !== false)) {
        filteredFollowers.push(follower.email);
      }
    }

    if (filteredFollowers.length === 0) {
      return { success: true, message: "All followers opted out of vehicle listing notifications" };
    }

    const emailPromises = filteredFollowers.map(followerEmail => {
      const unsubscribe_url = `${appUrl}/unsubscribe?email=${encodeURIComponent(followerEmail)}&type=vehicle`
      const unsubscribe_all_url = `${appUrl}/unsubscribe?email=${encodeURIComponent(followerEmail)}&type=all`

      return resend.emails.send({
        from: fromEmail,
        to: followerEmail,
        subject: `${author_name} listed a new vehicle on Speedio`,
        react: NewVehicleListingEmail({
          author_name,
          vehicle_title,
          vehicle_price,
          vehicle_year,
          vehicle_mileage,
          vehicle_location,
          vehicle_url,
          unsubscribe_url,
          unsubscribe_all_url,
        })
      })
    })

    await Promise.all(emailPromises)

    return { success: true, message: "NewVehicleListingEmail sent successfully" }
  } catch (error) {
    console.error("Error sending NewVehicleListingEmail", error)
    return { success: false, message: "Failed to send NewVehicleListingEmail" }
  }
}