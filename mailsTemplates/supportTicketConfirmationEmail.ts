interface SupportTicketConfirmationEmailProps {
  ticket_id: string | number;
  name: string;
  subject: string;
  message: string;
}

export default function SupportTicketConfirmationEmail({
  ticket_id,
  name,
  subject,
  message,
}: SupportTicketConfirmationEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Support Ticket Received</title>
</head>
<body style="margin:0; padding:40px 0; background-color:#f0f0f0; font-family:'Inter', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #2563eb 0%, #10b981 100%); border-radius:10px 10px 0 0; padding:30px 40px; text-align:center;">
              <h1 style="margin:0; font-size:28px; font-weight:700; color:#ffffff;">
                Thank You for Contacting Speedyo
              </h1>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Greeting -->
              <p style="margin:0 0 16px; font-size:16px; color:#374151;">
                Hi <strong>${name}</strong>,
              </p>

              <!-- Intro -->
              <p style="margin:0 0 20px; font-size:15px; color:#374151; line-height:1.7;">
                We've received your support request and will get back to you as soon as possible.
                Our support team typically responds within <strong>24–48 hours</strong> during business days.
              </p>

              <!-- Ticket Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:20px 24px;">
                    <p style="margin:0 0 14px; font-size:14px; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">Your Ticket</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:6px 0; font-size:14px; color:#6b7280; width:120px;">Ticket ID</td>
                        <td style="padding:6px 0; font-size:14px; color:#111827; font-weight:600;">#${ticket_id}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:14px; color:#6b7280;">Subject</td>
                        <td style="padding:6px 0; font-size:14px; color:#111827; font-weight:600;">${subject}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:20px 24px;">
                    <p style="margin:0 0 10px; font-size:14px; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">Your Message</p>
                    <p style="margin:0; font-size:15px; color:#374151; line-height:1.7; white-space:pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>

              <!-- Sign off -->
              <p style="margin:0; font-size:14px; color:#6b7280; line-height:1.8;">
                Best regards,<br/>
                <strong>The Speedyo Support Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} Speedyo. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}