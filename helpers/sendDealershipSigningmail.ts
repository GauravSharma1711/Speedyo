import { resend } from '../lib/resend'
import DealershipSendAgreementEmail from '@/mailsTemplates/dealershipSigning'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@speedyo.app'

export async function sendDealershipSendAgreementMail(
  email: string,
  dealership_name: string,
  representative_name: string,
  agreement_url: string,
  agreement_id: string,
  service_fee_amount?: number | null,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Speedyo Managed Sales Agreement - Action Required',
      html: DealershipSendAgreementEmail({
        dealership_name,
        representative_name,
        service_fee_amount,
        agreement_url,
        agreement_id,
      }),
    })

    return { success: true, message: 'Dealership send-agreement email sent successfully' }
  } catch (error) {
    console.error('Error sending dealership send-agreement email', error)
    return { success: false, message: 'Failed to send dealership send-agreement email' }
  }
}