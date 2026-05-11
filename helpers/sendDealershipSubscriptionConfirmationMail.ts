import { resend } from '../lib/resend'
import DealershipSubscriptionConfirmationEmail from '@/mailsTemplates/DealershipSubscriptionConfirmationEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const appUrl = process.env.APP_URL || 'https://speedio.app'

export async function sendDealershipSubscriptionConfirmationMail(
  user_email: string,
  full_name: string,
  tier_name: string,
  amount_paid: string | number,
  subscription_id: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: user_email,
      subject: '✅ Subscription Activated - Dealership Plan',
      html: DealershipSubscriptionConfirmationEmail({
        full_name,
        tier_name,
        amount_paid,
        subscription_id,
        dashboard_url: `${appUrl}/Dashboard`,
      })
    })

    return { success: true, message: "DealershipSubscriptionConfirmationEmail sent successfully" }
  } catch (error) {
    console.error("Error sending DealershipSubscriptionConfirmationEmail", error)
    return { success: false, message: "Failed to send DealershipSubscriptionConfirmationEmail" }
  }
}