import { resend } from '../lib/resend'
import VehicleSlotsPurchaseConfirmationEmail from '@/mailsTemplates/VehicleSlotsPurchaseConfirmationEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const appUrl = process.env.APP_URL || 'https://speedio.app'

export async function sendVehicleSlotsPurchaseConfirmationMail(
  user_email: string,
  full_name: string,
  amount_paid: string | number,
  quantity: number,
  transaction_id: string,
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: user_email,
      subject: '✅ Payment Confirmed - Vehicle Slots Purchased',
      react: VehicleSlotsPurchaseConfirmationEmail({
        full_name,
        amount_paid,
        quantity,
        transaction_id,
        dashboard_url: `${appUrl}/Dashboard`,
      })
    })

    return { success: true, message: "VehicleSlotsPurchaseConfirmationEmail sent successfully" }
  } catch (error) {
    console.error("Error sending VehicleSlotsPurchaseConfirmationEmail", error)
    return { success: false, message: "Failed to send VehicleSlotsPurchaseConfirmationEmail" }
  }
}