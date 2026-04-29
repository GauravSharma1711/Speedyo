import { resend } from '../lib/resend'
import AdminGuestPurchaseNotificationEmail from '@/mailsTemplates/AdminGuestPurchaseNotificationEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export async function sendAdminGuestPurchaseNotificationMail(
  admin_email: string,
  guest_name: string,
  guest_email: string,
  quantity: number,
  amount_paid: string | number,
  session_id: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: admin_email,
      subject: '🎉 New Guest Purchase - Private Seller Slots',
      react: AdminGuestPurchaseNotificationEmail({
        guest_name,
        guest_email,
        quantity,
        amount_paid,
        session_id,
      })
    })

    return { success: true, message: "AdminGuestPurchaseNotificationEmail sent successfully" }
  } catch (error) {
    console.error("Error sending AdminGuestPurchaseNotificationEmail", error)
    return { success: false, message: "Failed to send AdminGuestPurchaseNotificationEmail" }
  }
}