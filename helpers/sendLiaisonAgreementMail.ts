
import { resend } from '../lib/resend'
import LiaisonAgreementEmail from '@/mailsTemplates/liaison-agreement'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@speedyo.app'

export async function sendLiaisonAgreementMail(
  email: string,
  full_name: string,
  position_title: string,
  fixed_fee_percentage: number,
  residual_pay_percentage: number,
  status: string,
  phone: string,
  language_proficiency: string,
  agreement_id: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your Speedyo Liaison Agreement & Application',
      html: LiaisonAgreementEmail({
        full_name,
        position_title,
        fixed_fee_percentage,
        residual_pay_percentage,
        status,
        phone,
        email,
        language_proficiency,
        agreement_id,
      }),
    })

    return { success: true, message: "Liaison agreement email sent successfully" }
  } catch (error) {
    console.error("Error sending liaison agreement email", error)
    return { success: false, message: "Failed to send liaison agreement email" }
  }
}