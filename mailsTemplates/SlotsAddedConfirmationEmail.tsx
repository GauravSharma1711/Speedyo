interface EmailTemplateProps {
  full_name: string;
  quantity: number;
  total_amount: number;
  payment_id: string;
  new_total: number;
  current_used: number;
  available: number;
  has_promo?: boolean;
  is_guest_upgraded?: boolean;
  dashboard_url?: string;
}

export default function SlotsAddedConfirmationEmail({
  full_name,
  quantity,
  total_amount,
  payment_id,
  new_total,
  current_used,
  available,
  has_promo = false,
  is_guest_upgraded = false,
  dashboard_url = `${process.env.NEXT_PUBLIC_APP_URL}/Dashboard`,
}: EmailTemplateProps): string {
  const formattedAmount = (total_amount / 100).toFixed(2);
  const currentYear = new Date().getFullYear();
  const slotVerb = quantity > 1 ? 'slots have' : 'slot has';
  const vehicleLabel = available > 1 ? 'vehicles' : 'vehicle';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Slots Added - Speedyo Vehicle Slots</title>
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
                Payment Confirmed! 🎉
              </h1>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Greeting -->
              <p style="margin:0 0 12px; font-size:16px; color:#374151;">
                Hi <strong>${full_name}</strong>,
              </p>
              <p style="margin:0 0 24px; font-size:16px; color:#374151; line-height:1.6;">
                Thank you for your purchase! Your vehicle ${slotVerb} been successfully added to your account.
              </p>

              <!-- Order Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#f0fdf4; border-left:4px solid #10b981; border-radius:4px; padding:20px 24px;">
                    <p style="margin:0 0 12px; font-size:18px; font-weight:700; color:#065f46;">Order Details</p>
                    <p style="margin:0 0 6px; font-size:15px; color:#047857;">
                      <strong>Additional Slots:</strong> ${quantity}
                    </p>
                    <p style="margin:0 0 6px; font-size:15px; color:#047857;">
                      <strong>Amount Paid:</strong> ¥${formattedAmount}
                    </p>
                    ${has_promo ? `
                    <p style="margin:0 0 6px; font-size:15px; color:#047857;">
                      <strong>Promo Applied:</strong> SELLER20 (20% off)
                    </p>` : ''}
                    <p style="margin:0; font-size:15px; color:#047857;">
                      <strong>Payment ID:</strong> ${payment_id}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Account Status Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#eff6ff; border-left:4px solid #2563eb; border-radius:4px; padding:20px 24px;">
                    <p style="margin:0 0 12px; font-size:18px; font-weight:700; color:#1e40af;">Your Account Status</p>
                    <p style="margin:0 0 6px; font-size:15px; color:#1e3a8a;">
                      <strong>Total Slots:</strong> ${new_total}
                    </p>
                    <p style="margin:0 0 6px; font-size:15px; color:#1e3a8a;">
                      <strong>Used Slots:</strong> ${current_used}
                    </p>
                    <p style="margin:0 ${is_guest_upgraded ? '0 6px' : ''}; font-size:15px; color:#1e3a8a;">
                      <strong>Available Slots:</strong> ${available}
                    </p>
                    ${is_guest_upgraded ? `
                    <p style="margin:10px 0 0; padding:10px; background-color:#dbeafe; border-radius:4px; font-size:15px; color:#1e40af;">
                      <strong>🎉 You've been upgraded to Private Seller!</strong>
                    </p>` : ''}
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
              <p style="margin:0 0 12px; font-size:14px; color:#6b7280; line-height:1.6;">
                You can now sell ${available} ${vehicleLabel} on the marketplace!
              </p>
              <p style="margin:0 0 12px; font-size:14px; color:#6b7280; line-height:1.6;">
                If you have any questions, feel free to reply to this email or contact our support team.
              </p>
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
                © ${currentYear} Speedyo. All rights reserved.
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