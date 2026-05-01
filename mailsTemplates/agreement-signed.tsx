

interface AgreementSignedEmailProps {
  signer_name: string;
  dealership_name: string;
  representative_name: string;
  service_fee_amount: number;
  agreement_id: string;
}

export default function AgreementSignedEmail({
  signer_name,
  dealership_name,
  representative_name,
  service_fee_amount,
  agreement_id,
}: AgreementSignedEmailProps): string {
  const appUrl = process.env.APP_URL || 'https://speedyo.app';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Agreement Signed Successfully</title>
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
                Agreement Signed! 🎉
              </h1>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Greeting -->
              <p style="margin:0 0 16px; font-size:16px; color:#374151;">
                Dear <strong>${signer_name}</strong>,
              </p>

              <!-- Intro -->
              <p style="margin:0 0 24px; font-size:15px; color:#374151; line-height:1.7;">
                Thank you for signing the managed sales service agreement for <strong>${dealership_name}</strong>. Below are your agreement details for reference.
              </p>

              <!-- Details Box -->
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
                      <strong>Service Fee:</strong> $${service_fee_amount.toLocaleString()} per vehicle listing
                    </p>
                    <p style="margin:0 0 10px; font-size:15px; color:#374151;">
                      <strong>Signed By:</strong> ${signer_name}
                    </p>
                    <p style="margin:0; font-size:15px; color:#374151;">
                      <strong>Signed On:</strong> ${new Date().toLocaleDateString()}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Info -->
              <p style="margin:0 0 28px; font-size:15px; color:#374151; line-height:1.7;">
                You can now list vehicles on our platform with our managed sales service. Our team will contact you shortly to get started.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/agreements/${agreement_id}" style="display:inline-block; background:linear-gradient(135deg, #2563eb 0%, #10b981 100%); color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:700; font-size:15px;">
                      View Agreement
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