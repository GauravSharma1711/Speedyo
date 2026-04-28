import { resend } from '../lib/resend'
import SlotsAddedConfirmationEmail from '@/mailsTemplates/SlotsAddedConfirmationEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const appUrl = process.env.APP_URL || 'https://speedio.app'

export async function sendSlotsAddedConfirmationMail(
  email: string,
  full_name: string,
  quantity: number,
  total_amount: number,
  payment_id: string,
  new_total: number,
  current_used: number,
  available: number,
  has_promo?: boolean,
  is_guest_upgraded?: boolean,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Slots Added - Speedio Vehicle Slots',
      react: SlotsAddedConfirmationEmail({
        full_name,
        quantity,
        total_amount,
        payment_id,
        new_total,
        current_used,
        available,
        has_promo,
        is_guest_upgraded,
        dashboard_url: `${appUrl}/dashboard`,
      })
    })

    return { success: true, message: "SlotsAddedConfirmationEmail sent successfully" }
  } catch (error) {
    console.error("Error sending SlotsAddedConfirmationEmail", error)
    return { success: false, message: "Failed to send SlotsAddedConfirmationEmail" }
  }
}