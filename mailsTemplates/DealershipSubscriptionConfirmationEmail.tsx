interface EmailTemplateProps {
  full_name: string;
  tier_name: string;
  amount_paid: string | number;
  subscription_id: string;
  dashboard_url?: string;
}

export default function DealershipSubscriptionConfirmationEmail({
  full_name,
  tier_name,
  amount_paid,
  subscription_id,
  dashboard_url = `${process.env.NEXT_PUBLIC_APP_URL}/Dashboard`,
}: EmailTemplateProps): string {
  const startDate = new Date().toLocaleString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Subscription Activated - Dealership Plan</title>
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
                Subscription Activated! 🎉
              </h1>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Greeting -->
              <p style="margin:0 0 12px; font-size:15px; color:#333333;">
                Hi ${full_name},
              </p>
              <p style="margin:0 0 24px; font-size:15px; color:#333333; line-height:1.7;">
                Thank you for subscribing! Your dealership subscription has been successfully activated.
              </p>

              <!-- Subscription Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#f0fdf4; border-left:4px solid #10b981; border-radius:4px; padding:20px 24px;">
                    <p style="margin:0 0 12px; font-size:16px; font-weight:700; color:#10b981;">Subscription Details</p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Plan:</strong> ${tier_name} Dealership Plan
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Amount:</strong> ¥${amount_paid} JPY/month
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Start Date:</strong> ${startDate}
                    </p>
                    <p style="margin:0; font-size:15px; color:#333333;">
                      <strong>Subscription ID:</strong> ${subscription_id}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Upgrade Note -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#eff6ff; border-left:4px solid #2563eb; border-radius:4px; padding:20px 24px;">
                    <p style="margin:0; font-size:15px; color:#1e3a8a; line-height:1.7;">
                      Your account has been upgraded to a dealership account. You can now start listing vehicles and managing your dealership on Speedyo!
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${dashboard_url}" style="display:inline-block; background:linear-gradient(135deg, #2563eb 0%, #10b981 100%); color:#ffffff; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:700; font-size:16px;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>

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