// lib/mail/sendResetPasswordMail.ts
import { resend } from '../lib/resend'
import ResetPasswordEmail from '@/mailsTemplates/reset-password'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@speedyo.app'

export async function sendResetPasswordMail(
  email: string,
  full_name: string,
  reset_link: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset your Speedyo password',
      html: ResetPasswordEmail({ full_name, reset_link }),
    })

    return { success: true, message: "Reset password email sent successfully" }
  } catch (error) {
    console.error("Error sending reset password email", error)
    return { success: false, message: "Failed to send reset password email" }
  }
}