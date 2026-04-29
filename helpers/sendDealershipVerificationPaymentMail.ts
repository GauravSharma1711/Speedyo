import { resend } from '../lib/resend'
import DealershipVerificationPaymentEmail from '@/mailsTemplates/DealershipVerificationPaymentEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export async function sendDealershipVerificationPaymentMail(
  user_email: string,
  full_name: string,
  amount_paid: string | number,
  transaction_id: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: user_email,
      subject: '✅ Payment Confirmed - Dealership Verification',
      react: DealershipVerificationPaymentEmail({
        full_name,
        amount_paid,
        transaction_id,
      })
    })

    return { success: true, message: "DealershipVerificationPaymentEmail sent successfully" }
  } catch (error) {
    console.error("Error sending DealershipVerificationPaymentEmail", error)
    return { success: false, message: "Failed to send DealershipVerificationPaymentEmail" }
  }
}