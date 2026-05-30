import { resend } from '../lib/resend'
import AdminFeedbackNotificationEmail from '@/mailsTemplates/AdminFeedbackNotificationEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'feedback@speedyo.app'
const adminPanelUrl =
  `${process.env.NEXTAUTH_URL}/adminpanel` ||
  "http://localhost:3000/AdminPanel";

export async function sendAdminFeedbackNotificationMail(
  rating: number,
  category: string,
  feedback_text: string,
  user_name?: string,
  user_email?: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: 'kevin@speedyo.app',
      subject: `New Feedback Received - ${rating}/5 Stars`,
      react: AdminFeedbackNotificationEmail({
        user_name,
        user_email,
        rating,
        category,
        feedback_text,
        admin_panel_url: adminPanelUrl,
      })
    })

    return { success: true, message: "AdminFeedbackNotificationEmail sent successfully" }
  } catch (error) {
    console.error("Error sending AdminFeedbackNotificationEmail", error)
    return { success: false, message: "Failed to send AdminFeedbackNotificationEmail" }
  }
}