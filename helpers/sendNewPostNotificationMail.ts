import { resend } from '../lib/resend'
import NewPostNotificationEmail from '@/mailsTemplates/newPostNotificationEmail'
import prisma from '@/db/prisma'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const appUrl = process.env.APP_URL || 'https://speedio.app'

export async function sendNewPostNotificationMail(
  followerEmails: { email: string; userId: string }[],
  author_name: string,
  post_content?: string,
) {
  if (followerEmails.length === 0) return { success: true, message: "No followers" };

  try {
    const post_url = `${appUrl}/feed`

    const filteredFollowers = [];
    for (const follower of followerEmails) {
      const settings = await prisma.emailNotifications.findUnique({
        where: { user_id: follower.userId },
      });

      const canSend = !settings || settings.enabled !== false;
      if (canSend && (settings?.newPostsFromFollowedUsers !== false)) {
        filteredFollowers.push(follower.email);
      }
    }

    if (filteredFollowers.length === 0) {
      return { success: true, message: "All followers opted out of post notifications" };
    }

    const emailPromises = filteredFollowers.map(followerEmail => {
      const unsubscribe_url = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(followerEmail)}&type=vehicle`
      const unsubscribe_all_url = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(followerEmail)}&type=all`

      return resend.emails.send({
        from: fromEmail,
        to: followerEmail,
        subject: `${author_name} shared a new post on Speedio`,
        react: NewPostNotificationEmail({
          author_name,
          post_content,
          post_url,
          unsubscribe_url,
          unsubscribe_all_url,
        })
      })
    })

    await Promise.all(emailPromises)

    return { success: true, message: "NewPostNotificationEmail sent successfully" }
  } catch (error) {
    console.error("Error sending NewPostNotificationEmail", error)
    return { success: false, message: "Failed to send NewPostNotificationEmail" }
  }
}