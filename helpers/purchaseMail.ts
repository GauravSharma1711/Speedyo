import { resend } from '../lib/resend'
import PurchaseEmail from '@/mailsTemplates/Purchase'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export async function sendPurchaseMail(
  full_name: string,
  email: string,
  quantity: number,
  total_amount: number,
  has_promo?: boolean,
  promo_code?: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '🚀 Your Speedio Purchase is Almost Complete!',
      react: PurchaseEmail({ full_name, email, quantity, total_amount, has_promo, promo_code })
    })

    return { success: true, message: "PurchaseEmail sent successfully" }
  } catch (error) {
    console.error("Error sending PurchaseEmail", error)
    return { success: false, message: "Failed to send PurchaseEmail" }
  }
}