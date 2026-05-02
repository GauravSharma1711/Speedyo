
import { resend } from '../lib/resend'
import AgreementSignedEmail from '@/mailsTemplates/agreement-signed'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@speedyo.app'

export async function sendAgreementSignedMail(
  email: string,
  signer_name: string,
  dealership_name: string,
  representative_name: string,
  service_fee_amount: number,
  agreement_id: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your Speedyo Managed Sales Agreement - Signed Successfully',
      html: AgreementSignedEmail({
        signer_name,
        dealership_name,
        representative_name,
        service_fee_amount,
        agreement_id,
      }),
    })

    return { success: true, message: "Agreement signed email sent successfully" }
  } catch (error) {
    console.error("Error sending agreement signed email", error)
    return { success: false, message: "Failed to send agreement signed email" }
  }
}