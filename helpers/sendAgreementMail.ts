// lib/mail/sendAgreementMail.ts
import { resend } from '../lib/resend'
import AgreementSendEmail from '@/mailsTemplates/agreement-send'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@speedyo.app'

export async function sendAgreementMail(
  email: string,
  representative_name: string,
  dealership_name: string,
  status: string,
  agreement_id: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your Speedyo Managed Sales Service Agreement',
      html: AgreementSendEmail({
        representative_name,
        dealership_name,
        status,
        agreement_id,
      }),
    })

    return { success: true, message: "Agreement email sent successfully" }
  } catch (error) {
    console.error("Error sending agreement email", error)
    return { success: false, message: "Failed to send agreement email" }
  }
}