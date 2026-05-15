interface EmailTemplateProps {
  full_name: string;
  email: string;
  quantity: number;
  total_amount: number;
  has_promo?: boolean;
  promo_code?: string;
  stripe_session_id: string;
}

export default function AdminPurchaseNotificationEmail({
  full_name,
  email,
  quantity,
  total_amount,
  has_promo = false,
  promo_code = '',
  stripe_session_id,
}: EmailTemplateProps): string {
  const formattedAmount = (total_amount / 100).toFixed(2);
  const createdAt = new Date().toLocaleString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Guest Purchase Created</title>
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
                New Private Seller Order Created
              </h2>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Customer Information Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:20px 24px;">
                    <p style="margin:0 0 14px; font-size:16px; font-weight:700; color:#111111;">Customer Information</p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Name:</strong> ${full_name}
                    </p>
                    <p style="margin:0; font-size:15px; color:#333333;">
                      <strong>Email:</strong> ${email}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Order Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f0fdf4; border:1px solid #d1fae5; border-radius:8px; padding:20px 24px;">
                    <p style="margin:0 0 14px; font-size:16px; font-weight:700; color:#10b981;">Order Details</p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Slots Purchased:</strong> ${quantity}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Amount:</strong> ¥${formattedAmount} JPY
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Promo Code:</strong> ${has_promo ? `✅ ${promo_code} (20% discount applied)` : '❌ None'}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Stripe Session ID:</strong> ${stripe_session_id}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Status:</strong> Pending Payment
                    </p>
                    <p style="margin:0; font-size:15px; color:#333333;">
                      <strong>Created At:</strong> ${createdAt}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Action Required Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#fef3c7; border:1px solid #fde68a; border-radius:8px; padding:16px 24px;">
                    <p style="margin:0; font-size:15px; color:#333333;">
                      <strong>⏳ Action Required:</strong> Monitor for payment completion via webhook.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Footer note -->
              <p style="margin:0; font-size:13px; color:#6b7280;">
                This is an automated notification from Speedio's guest checkout system.
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