import { resend } from '../lib/resend'
import GuestPaymentConfirmationEmail from '@/mailsTemplates/GuestPaymentConfirmationEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const appUrl = process.env.APP_URL || 'https://speedio.app'

export async function sendGuestPaymentConfirmationMail(
  guest_email: string,
  guest_name: string,
  amount_paid: string | number,
  quantity: number,
  transaction_id: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: guest_email,
      subject: '✅ Payment Confirmed - Welcome to Speedio!',
      react: GuestPaymentConfirmationEmail({
        guest_name,
        guest_email,
        amount_paid,
        quantity,
        transaction_id,
        login_url: `${appUrl}/signIn`,
      })
    })

    return { success: true, message: "GuestPaymentConfirmationEmail sent successfully" }
  } catch (error) {
    console.error("Error sending GuestPaymentConfirmationEmail", error)
    return { success: false, message: "Failed to send GuestPaymentConfirmationEmail" }
  }
}