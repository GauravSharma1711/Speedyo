import { resend } from '../lib/resend'
import PhotographerSendAgreementEmail from '@/mailsTemplates/PhotographerSigning'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@speedyo.app'

export async function sendPhotographerSendAgreementMail(
  email: string,
  position_title: string,
  fixed_percentage: number,
  agreement_url: string,
  agreement_id: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Speedyo Photographer Partnership - Complete Your Application',
      html: PhotographerSendAgreementEmail({
        position_title,
        fixed_percentage,
        agreement_url,
        agreement_id,
      }),
    })

    return { success: true, message: 'Photographer send-agreement email sent successfully' }
  } catch (error) {
    console.error('Error sending photographer send-agreement email', error)
    return { success: false, message: 'Failed to send photographer send-agreement email' }
  }
}