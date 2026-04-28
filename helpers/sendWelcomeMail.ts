import { resend } from '../lib/resend'
import WelcomeEmail from '@/mailsTemplates/welcome'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@speedyo.app'
const appUrl = process.env.APP_URL || 'https://speedyo.app'

export async function sendWelcomeMail(
  email: string,
  full_name: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to Speedyo!',
      react: WelcomeEmail({
        full_name,
        marketplace_url: `${appUrl}/marketplace`,
        feed_url: `${appUrl}/feed`,
      })
    })

    return { success: true, message: "WelcomeEmail sent successfully" }
  } catch (error) {
    console.error("Error sending WelcomeEmail", error)
    return { success: false, message: "Failed to send WelcomeEmail" }
  }
}