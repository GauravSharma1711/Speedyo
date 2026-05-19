import { resend } from '../lib/resend'
import PaymentConfirmationEmail from '@/mailsTemplates/PaymentConfirmationEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const appUrl = process.env.APP_URL || 'https://speedyo.app'

export async function sendPaymentConfirmationMail(
  full_name: string,
  email: string,
  quantity: number,
  total_amount: string,
  payment_id: string,
  has_promo?: boolean,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Payment Confirmed - Speedyo Vehicle Slots',
      html: PaymentConfirmationEmail({
        full_name,
        email,
        quantity,
        total_amount,
        payment_id,
        has_promo,
        register_url: `${appUrl}/register`,
      })
    })

    return { success: true, message: "PaymentConfirmationEmail sent successfully" }
  } catch (error) {
    console.error("Error sending PaymentConfirmationEmail", error)
    return { success: false, message: "Failed to send PaymentConfirmationEmail" }
  }
}