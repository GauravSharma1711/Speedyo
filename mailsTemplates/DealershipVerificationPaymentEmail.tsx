import * as React from 'react';

interface EmailTemplateProps {
  full_name: string;
  amount_paid: string | number;
  transaction_id: string;
}

export default function DealershipVerificationPaymentEmail({
  full_name,
  amount_paid,
  transaction_id,
}: EmailTemplateProps): string {
  const paymentDate = new Date().toLocaleString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Confirmed - Dealership Verification</title>
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
                Thank you for your payment! Your dealership verification fee has been successfully processed.
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
                      <strong>Payment Type:</strong> Dealership Verification Fee
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

              <!-- Status Note -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#fef3c7; border-left:4px solid #f59e0b; border-radius:4px; padding:20px 24px;">
                    <p style="margin:0 0 8px; font-size:15px; color:#333333; line-height:1.7;">
                      Your dealership application is now under review. Our team will verify your business documents and get back to you within <strong>1-2 business days</strong>.
                    </p>
                    <p style="margin:0; font-size:15px; color:#333333; line-height:1.7;">
                      If you have any questions, feel free to reach out to our support team.
                    </p>
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