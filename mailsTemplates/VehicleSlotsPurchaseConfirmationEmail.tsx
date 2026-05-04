interface EmailTemplateProps {
  full_name: string;
  amount_paid: string | number;
  quantity: number;
  transaction_id: string;
  dashboard_url?: string;
}

export default function VehicleSlotsPurchaseConfirmationEmail({
  full_name,
  amount_paid,
  quantity,
  transaction_id,
  dashboard_url = 'https://speedio.app/Dashboard',
}: EmailTemplateProps): string {
  const paymentDate = new Date().toLocaleString();
  const vehicleLabel = quantity > 1 ? 'vehicles' : 'vehicle';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Confirmed - Vehicle Slots Purchased</title>
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
                Hi ${full_name},
              </p>
              <p style="margin:0 0 24px; font-size:15px; color:#333333; line-height:1.7;">
                Thank you for your purchase! Your vehicle slot payment has been successfully processed.
              </p>

              <!-- Payment Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#f0fdf4; border-left:4px solid #10b981; border-radius:4px; padding:20px 24px;">
                    <p style="margin:0 0 12px; font-size:16px; font-weight:700; color:#10b981;">Payment Details</p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Amount Paid:</strong> $${amount_paid} USD
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Vehicle Slots Purchased:</strong> ${quantity}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Payment Date:</strong> ${paymentDate}
                    </p>
                    <p style="margin:0; font-size:15px; color:#333333;">
                      <strong>Transaction ID:</strong> ${transaction_id}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Next Step -->
              <p style="margin:0 0 12px; font-size:15px; color:#333333; line-height:1.7;">
                You can now list up to ${quantity} ${vehicleLabel} for sale on Speedio!
              </p>
              <p style="margin:0 0 28px; font-size:15px; color:#333333; line-height:1.7;">
                Visit your
                <a href="${dashboard_url}" style="color:#2563eb; text-decoration:none; font-weight:600;">Dashboard</a>
                to create your first listing.
              </p>

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
                <strong>The Speedio Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} Speedio. All rights reserved.
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