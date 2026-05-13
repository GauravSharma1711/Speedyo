import { resend } from '../lib/resend'
import LiaisonSendAgreementEmail from '@/mailsTemplates/LiaisonSigning'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@speedio.app'

export async function sendLiaisonSendAgreementMail(
  email: string,
  full_name: string,
  position_title: string,
  fixed_fee_percentage: number,
  residual_pay_percentage: number,
  agreement_url: string,
  agreement_id: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Speedio Liaison Agreement - Review & Complete Your Application',
      html: LiaisonSendAgreementEmail({
        full_name,
        position_title,
        fixed_fee_percentage,
        residual_pay_percentage,
        agreement_url,
        agreement_id,
      }),
    })

    return { success: true, message: 'Liaison send-agreement email sent successfully' }
  } catch (error) {
    console.error('Error sending liaison send-agreement email', error)
    return { success: false, message: 'Failed to send liaison send-agreement email' }
  }
}