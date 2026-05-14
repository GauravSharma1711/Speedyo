import { resend } from '../lib/resend'
import DealershipInquiryAdminEmail from '@/mailsTemplates/dealershipInquiryAdminEmail'
import DealershipInquiryConfirmationEmail from '@/mailsTemplates/dealershipInquiryConfirmationEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@speedyo.app'
// const adminEmail = process.env.ADMIN_EMAIL || 'kevin@speedyo.app'
const adminEmail = process.env.ADMIN_EMAIL || 'gau1711sha@gmail.com'

export async function sendDealershipInquiryMails(input: {
  dealershipName: string
  contactName: string
  email: string
  phone: string
  message: string
}) {
  try {
    // 1. Notify the Speedyo team
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Dealership Managed Sales Inquiry — ${input.dealershipName}`,
      html: DealershipInquiryAdminEmail(input),
    })

    // 2. Confirm receipt to the dealership contact
    await resend.emails.send({
      from: fromEmail,
      to: input.email,
      subject: 'Thank You for Your Interest in Speedyo Dealership Services',
      html: DealershipInquiryConfirmationEmail({
        contact_name: input.contactName,
      }),
    })

    return { success: true, message: 'Dealership inquiry emails sent successfully' }
  } catch (error) {
    console.error('Error sending dealership inquiry emails', error)
    return { success: false, message: 'Failed to send dealership inquiry emails' }
  }
}