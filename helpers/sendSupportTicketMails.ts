import { resend } from '../lib/resend'
import SupportTicketAdminEmail from '@/mailsTemplates/supportTicketAdminEmail'
import SupportTicketConfirmationEmail from '@/mailsTemplates/supportTicketConfirmationEmail'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'support@speedyo.app'
// const adminEmail = process.env.SUPPORT_ADMIN_EMAIL || 'kevin@speedyo.app'
const adminEmail = 'gau1711sha@gmail.com'

export async function sendSupportTicketMails(input: {
  ticket_id: string | number
  name: string
  email: string
  ticket_type: string
  subject: string
  message: string
}) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `New Support Ticket [#${input.ticket_id}]: ${input.subject}`,
      html: SupportTicketAdminEmail(input),
    })

    await resend.emails.send({
      from: fromEmail,
      to: input.email,
      subject: `Support Ticket Received [#${input.ticket_id}]`,
      html: SupportTicketConfirmationEmail({
        ticket_id: input.ticket_id,
        name: input.name,
        subject: input.subject,
        message: input.message,
      }),
    })

    return { success: true, message: 'Support ticket emails sent successfully' }
  } catch (error) {
    console.error('Error sending support ticket emails', error)
    return { success: false, message: 'Failed to send support ticket emails' }
  }
}