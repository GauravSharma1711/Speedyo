interface SupportTicketAdminEmailProps {
  ticket_id: string | number;
  name: string;
  email: string;
  ticket_type: string;
  subject: string;
  message: string;
}

export default function SupportTicketAdminEmail({
  ticket_id,
  name,
  email,
  ticket_type,
  subject,
  message,
}: SupportTicketAdminEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Support Ticket</title>
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
                New Speedyo Support Ticket
              </h1>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <p style="margin:0 0 20px; font-size:16px; color:#374151;">
                A new support ticket has been submitted and requires your attention.
              </p>

              <!-- Ticket Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:20px 24px;">
                    <p style="margin:0 0 14px; font-size:14px; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">Ticket Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:6px 0; font-size:14px; color:#6b7280; width:120px;">Ticket ID</td>
                        <td style="padding:6px 0; font-size:14px; color:#111827; font-weight:600;">#${ticket_id}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:14px; color:#6b7280;">From</td>
                        <td style="padding:6px 0; font-size:14px; color:#111827; font-weight:600;">
                          ${name} (<a href="mailto:${email}" style="color:#2563eb; text-decoration:none;">${email}</a>)
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:14px; color:#6b7280;">Type</td>
                        <td style="padding:6px 0; font-size:14px; color:#111827; font-weight:600;">${ticket_type}</td>
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
                    <p style="margin:0 0 10px; font-size:14px; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">Message</p>
                    <p style="margin:0; font-size:15px; color:#374151; line-height:1.7; white-space:pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="https://speedyo.app/AdminPanel" style="display:inline-block; background:linear-gradient(135deg, #2563eb 0%, #10b981 100%); color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:700; font-size:15px;">
                      View in Admin Panel
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Sign off -->
              <p style="margin:0; font-size:14px; color:#6b7280; line-height:1.8;">
                — <strong>Speedyo Notifications</strong>
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