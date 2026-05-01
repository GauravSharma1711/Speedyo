
import { resend } from '../lib/resend'
import PhotographerAgreementEmail from '@/mailsTemplates/photographer-agreement'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@speedyo.app'

export async function sendPhotographerAgreementMail(
  email: string,
  full_name: string,
  position_title: string,
  fixed_percentage: number,
  status: string,
  phone: string,
  photography_experience_years: number,
  agreement_id: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your Speedyo Photographer Agreement & Application',
      html: PhotographerAgreementEmail({
        full_name,
        position_title,
        fixed_percentage,
        status,
        phone,
        email,
        photography_experience_years,
        agreement_id,
      }),
    })

    return { success: true, message: "Photographer agreement email sent successfully" }
  } catch (error) {
    console.error("Error sending photographer agreement email", error)
    return { success: false, message: "Failed to send photographer agreement email" }
  }
}