interface EmailTemplateProps {
  guest_name: string;
  guest_email: string;
  quantity: number;
  amount_paid: string | number;
  session_id: string;
}

export default function AdminGuestPurchaseNotificationEmail({
  guest_name,
  guest_email,
  quantity,
  amount_paid,
  session_id,
}: EmailTemplateProps): string {
  const purchaseDate = new Date().toLocaleString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Guest Purchase - Private Seller Slots</title>
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
                New Guest Purchase
              </h2>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Intro -->
              <p style="margin:0 0 20px; font-size:15px; color:#333333; line-height:1.7;">
                A guest has just purchased private seller slots!
              </p>

              <!-- Purchase Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:20px 24px;">
                    <p style="margin:0 0 14px; font-size:16px; font-weight:700; color:#111111;">Purchase Details</p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Guest Name:</strong> ${guest_name}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Email:</strong> ${guest_email}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Slots Purchased:</strong> ${quantity}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Amount Paid:</strong> $${amount_paid} USD
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Purchase Date:</strong> ${purchaseDate}
                    </p>
                    <p style="margin:0; font-size:15px; color:#333333;">
                      <strong>Session ID:</strong> ${session_id}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Note -->
              <p style="margin:0; font-size:14px; color:#64748b; line-height:1.6;">
                The user will need to create an account with this email to activate their slots.
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