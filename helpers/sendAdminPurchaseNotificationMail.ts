import { resend } from '../lib/resend'
import AdminPurchaseNotificationEmail from '@/mailsTemplates/AdminPurchaseNotificationEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export async function sendAdminPurchaseNotificationMail(
  full_name: string,
  email: string,
  quantity: number,
  total_amount: number,
  stripe_session_id: string,
  has_promo?: boolean,
  promo_code?: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: 'admin@speedyo.app',
      subject: '🛒 New Guest Purchase Created - Private Seller Promo',
      react: AdminPurchaseNotificationEmail({
        full_name,
        email,
        quantity,
        total_amount,
        stripe_session_id,
        has_promo,
        promo_code,
      })
    })

    return { success: true, message: "AdminPurchaseNotificationEmail sent successfully" }
  } catch (error) {
    console.error("Error sending AdminPurchaseNotificationEmail", error)
    return { success: false, message: "Failed to send AdminPurchaseNotificationEmail" }
  }
}