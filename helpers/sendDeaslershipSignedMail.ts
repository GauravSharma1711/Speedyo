import { resend } from '../lib/resend'
import DealershipSignedAgreementEmail from '@/mailsTemplates/dealershipSignedMail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@speedyo.app'

export async function sendDealershipSignedAgreementMail(
  email: string,
  dealership_name: string,
  representative_name: string,
  agreement_id: string,
  service_fee_amount?: number | null,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your Speedyo Managed Sales Agreement — Signed & Confirmed',
      html: DealershipSignedAgreementEmail({
        dealership_name,
        representative_name,
        service_fee_amount,
        agreement_id,
      }),
    })

    return { success: true, message: 'Dealership signed-agreement email sent successfully' }
  } catch (error) {
    console.error('Error sending dealership signed-agreement email', error)
    return { success: false, message: 'Failed to send dealership signed-agreement email' }
  }
}