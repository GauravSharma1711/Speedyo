import { resend } from '../lib/resend'
import ManagedSaleRequestSubmittedEmail from '@/mailsTemplates/ManagedSaleRequestSubmittedEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const appUrl = process.env.APP_URL ;

export async function sendManagedSaleRequestSubmittedMail(email: string, full_name: string, request_id: string) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'We received your managed sale request',
      react: ManagedSaleRequestSubmittedEmail({ full_name, request_id, app_url: appUrl })
    })

    return { success: true, message: "ManagedSaleRequestSubmittedEmail sent successfully" }
  } catch (error) {
    console.error("Error sending ManagedSaleRequestSubmittedEmail", error)
    return { success: false, message: "Failed to send ManagedSaleRequestSubmittedEmail" }
  }
}
