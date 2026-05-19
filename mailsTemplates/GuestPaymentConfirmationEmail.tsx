interface EmailTemplateProps {
  guest_name: string;
  guest_email: string;
  amount_paid: string | number;
  quantity: number;
  transaction_id: string;
  login_url?: string;
}

export default function GuestPaymentConfirmationEmail({
  guest_name,
  guest_email,
  amount_paid,
  quantity,
  transaction_id,
  login_url = `${process.env.NEXT_PUBLIC_APP_URL}/signIn`,
}: EmailTemplateProps): string {
  const paymentDate = new Date().toLocaleString();
  const slotLabel = quantity > 1 ? 'slots' : 'slot';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Confirmed - Welcome to Speedyo!</title>
</head>
<body style="margin:0; padding:40px 0; background-color:#f0f0f0; font-family:'Inter', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#eef0f5; border-radius:10px 10px 0 0; padding:30px 40px;">
              <h2 style="margin:0; font-size:22px; font-weight:600; color:#2563eb;">
                Payment Confirmation
              </h2>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Greeting -->
              <p style="margin:0 0 12px; font-size:15px; color:#333333;">
                Hi ${guest_name},
              </p>
              <p style="margin:0 0 24px; font-size:15px; color:#333333; line-height:1.7;">
                Thank you for your purchase! Your vehicle slot payment has been successfully processed.
              </p>

              <!-- Payment Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#f0fdf4; border-left:4px solid #10b981; border-radius:4px; padding:20px 24px;">
                    <p style="margin:0 0 12px; font-size:16px; font-weight:700; color:#10b981;">Payment Details</p>
                    <p style="margin:0 0 6px; font-size:15px; color:#333333;">
                      <strong>Amount Paid:</strong> ¥${amount_paid} JPY
                    </p>
                    <p style="margin:0 0 6px; font-size:15px; color:#333333;">
                      <strong>Vehicle Slots Purchased:</strong> ${quantity}
                    </p>
                    <p style="margin:0 0 6px; font-size:15px; color:#333333;">
                      <strong>Payment Date:</strong> ${paymentDate}
                    </p>
                    <p style="margin:0; font-size:15px; color:#333333;">
                      <strong>Transaction ID:</strong> ${transaction_id}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Next Steps Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#eff6ff; border-left:4px solid #2563eb; border-radius:4px; padding:20px 24px;">
                    <p style="margin:0 0 12px; font-size:16px; font-weight:700; color:#2563eb;">Next Steps</p>
                    <ol style="margin:0; padding-left:20px; color:#333333; font-size:15px; line-height:2;">
                      <li>
                        <strong>Create Your Account:</strong> Visit
                        <a href="${login_url}" style="color:#2563eb; text-decoration:none; font-weight:600;">speedyo.app</a>
                        and register using this email address (${guest_email})
                      </li>
                      <li>
                        <strong>Activate Your Slots:</strong> Once logged in, your ${quantity} vehicle ${slotLabel} will be automatically activated
                      </li>
                      <li>
                        <strong>Start Listing:</strong> Create your first vehicle listing and connect with buyers!
                      </li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${login_url}" style="display:inline-block; background:linear-gradient(135deg, #2563eb 0%, #10b981 100%); color:#ffffff; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:700; font-size:16px;">
                      Create Your Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Support -->
              <p style="margin:0 0 16px; font-size:14px; color:#6b7280; line-height:1.6;">
                If you have any questions, feel free to reach out to our support team at
                <a href="mailto:support@speedyo.app" style="color:#2563eb; text-decoration:none;">support@speedyo.app</a>
              </p>

              <!-- Sign off -->
              <p style="margin:0; font-size:14px; color:#6b7280; line-height:1.8;">
                Best regards,<br/>
                <strong>The Speedyo Team</strong>
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