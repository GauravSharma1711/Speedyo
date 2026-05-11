interface EmailTemplateProps {
  full_name: string;
  email: string;
  quantity: number;
  total_amount: number;
  has_promo?: boolean;
  promo_code?: string;
}

export default function PurchaseEmail({
  full_name,
  email,
  quantity,
  total_amount,
  has_promo = false,
  promo_code = '',
}: EmailTemplateProps): string {
  const formattedAmount = (total_amount / 100).toFixed(2);
  const orderDate = new Date().toLocaleString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Speedio Purchase is Almost Complete!</title>
</head>
<body style="margin:0; padding:40px 0; background-color:#f0f0f0; font-family:'Inter', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #2563eb 0%, #10b981 100%); border-radius:10px 10px 0 0; padding:30px 40px; text-align:center;">
              <h1 style="margin:0; font-size:28px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">
                Almost There! 🎉
              </h1>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Greeting -->
              <p style="margin:0 0 8px; font-size:18px; color:#2563eb; font-weight:700;">
                Hi ${full_name},
              </p>

              <!-- Intro -->
              <p style="margin:0 0 24px; font-size:15px; color:#333333; line-height:1.6;">
                You're just one step away from joining Speedio as a Private Seller!
              </p>

              <!-- Order Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#f0fdf4; border-left:4px solid #10b981; border-radius:5px; padding:20px 24px;">
                    <p style="margin:0 0 14px; font-size:20px; font-weight:700; color:#10b981;">📦 Your Order Summary</p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Vehicle Slots:</strong> ${quantity}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Total Amount:</strong> $${formattedAmount} JPY
                    </p>
                    ${has_promo ? `
                    <p style="margin:0 0 8px; font-size:15px; color:#10b981;">
                      <strong>✨ Discount Applied:</strong> 20% OFF with code ${promo_code}
                    </p>` : ''}
                    <p style="margin:0; font-size:15px; color:#333333;">
                      <strong>Order Date:</strong> ${orderDate}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Complete Payment Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#eff6ff; border-left:4px solid #2563eb; border-radius:5px; padding:20px 24px;">
                    <p style="margin:0 0 12px; font-size:18px; font-weight:700; color:#2563eb;">⏳ Complete Your Payment</p>
                    <p style="margin:0 0 10px; font-size:15px; color:#333333; line-height:1.6;">
                      We've reserved your slots! Please complete your payment to activate them.
                    </p>
                    <p style="margin:0; font-size:15px; color:#333333; line-height:1.6;">
                      If you haven't completed your payment yet, you can return to the checkout page to finish.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- What Happens Next Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#fef3c7; border-left:4px solid #f59e0b; border-radius:5px; padding:20px 24px;">
                    <p style="margin:0 0 12px; font-size:18px; font-weight:700; color:#f59e0b;">🎯 What Happens Next?</p>
                    <ol style="margin:0; padding-left:20px; color:#333333; font-size:15px; line-height:1.8;">
                      <li style="margin-bottom:8px;">Complete your payment through Stripe's secure checkout</li>
                      <li style="margin-bottom:8px;">Receive your payment confirmation email</li>
                      <li style="margin-bottom:8px;">Register on Speedio using this email (<strong>${email}</strong>)</li>
                      <li>Your slots will be automatically activated!</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="https://speedio.app" style="display:inline-block; background:linear-gradient(135deg, #2563eb 0%, #10b981 100%); color:#ffffff; padding:15px 40px; text-decoration:none; border-radius:8px; font-weight:700; font-size:16px;">
                      Visit Speedio
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="border-top:1px solid #e5e7eb; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Support -->
              <p style="margin:0 0 10px; font-size:14px; color:#6b7280; text-align:center;">
                Questions? Contact us at <a href="mailto:support@speedio.app" style="color:#2563eb; text-decoration:none;">support@speedio.app</a>
              </p>

              <!-- Footer note -->
              <p style="margin:0; font-size:12px; color:#9ca3af; text-align:center;">
                This email was sent to ${email}. You're receiving this because you started a purchase on Speedio.
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