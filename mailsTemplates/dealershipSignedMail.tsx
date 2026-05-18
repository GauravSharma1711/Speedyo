interface DealershipSignedAgreementEmailProps {
  dealership_name: string;
  representative_name: string;
  service_fee_amount?: number | null;
  agreement_id: string;
}

export default function DealershipSignedAgreementEmail({
  dealership_name,
  representative_name,
  service_fee_amount,
  agreement_id,
}: DealershipSignedAgreementEmailProps): string {
  const appUrl = process.env.APP_URL || 'https://speedyo.app';
  const viewUrl = `${appUrl}/ViewDealershipAgreement/${agreement_id}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Speedyo Managed Sales Agreement</title>
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
                Agreement Signed Successfully ✅
              </h1>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <p style="margin:0 0 16px; font-size:16px; color:#374151;">
                Dear ${representative_name},
              </p>

              <p style="margin:0 0 24px; font-size:15px; color:#374151; line-height:1.7;">
                Thank you for signing the managed sales service agreement for <strong>${dealership_name}</strong>. You can now list vehicles on our platform with our managed sales service.
              </p>

              <!-- Agreement Details -->
              <p style="margin:0 0 8px; font-size:13px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em;">Agreement Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:20px 24px;">
                    <p style="margin:0 0 10px; font-size:15px; color:#374151;">
                      <strong>Dealership:</strong> ${dealership_name}
                    </p>
                    <p style="margin:0 0 10px; font-size:15px; color:#374151;">
                      <strong>Representative:</strong> ${representative_name}
                    </p>
                    <p style="margin:0 0 10px; font-size:15px; color:#374151;">
                      <strong>Service Fee:</strong> ${service_fee_amount ? `¥${service_fee_amount.toLocaleString()} per vehicle` : 'Varies per vehicle listing'}
                    </p>
                    <p style="margin:0; font-size:15px; color:#374151;">
                      <strong>Status:</strong>
                      <span style="display:inline-block; margin-left:6px; background-color:#d1fae5; color:#065f46; padding:2px 10px; border-radius:12px; font-size:13px; font-weight:600;">
                        SIGNED
                      </span>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px; font-size:15px; color:#374151; line-height:1.7;">
                You can view your signed agreement at any time by clicking the button below:
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${viewUrl}" style="display:inline-block; background:linear-gradient(135deg, #2563eb 0%, #10b981 100%); color:#ffffff; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:700; font-size:15px;">
                      View Signed Agreement
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px; font-size:14px; color:#6b7280; line-height:1.8;">
                If you have any questions, please don't hesitate to reach out.
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