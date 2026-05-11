import { resend } from '../lib/resend'
import AdminNewUserNotificationEmail from '@/mailsTemplates/AdminNewUserNotificationEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const adminPanelUrl = process.env.ADMIN_PANEL_URL || 'http://localhost:3000/AdminPanel'

export async function sendAdminNewUserNotificationMail(
  adminEmails: string[],
  full_name: string,
  email: string,
  user_type: string,
  created_date: string,
  user_id: string,
) {
  try {
    const emailPromises = adminEmails.map(adminEmail =>
      resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: '🎉 New User Registration on Speedio',
        react: AdminNewUserNotificationEmail({
          full_name,
          email,
          user_type,
          created_date,
          user_id,
          admin_panel_url: adminPanelUrl,
        })
      })
    )

    await Promise.all(emailPromises)

    return { success: true, message: "AdminNewUserNotificationEmail sent successfully" }
  } catch (error) {
    console.error("Error sending AdminNewUserNotificationEmail", error)
    return { success: false, message: "Failed to send AdminNewUserNotificationEmail" }
  }
}