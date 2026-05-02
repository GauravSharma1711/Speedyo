

interface AgreementSendEmailProps {
  representative_name: string;
  dealership_name: string;
  status: string;
  agreement_id: string;
}

export default function AgreementSendEmail({
  representative_name,
  dealership_name,
  status,
  agreement_id,
}: AgreementSendEmailProps): string {
  const appUrl = process.env.APP_URL || 'https://speedyo.app';
  const isSigned = status === 'signed';
  const viewUrl = isSigned
    ? `${appUrl}/ViewDealershipAgreement?id=${agreement_id}`
    : `${appUrl}/SignAgreement?id=${agreement_id}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Speedyo Agreement</title>
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
                ${isSigned ? 'Agreement Signed! 🎉' : 'Your Agreement is Ready 📄'}
              </h1>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Greeting -->
              <p style="margin:0 0 16px; font-size:16px; color:#374151;">
                Hello <strong>${representative_name}</strong>,
              </p>

              <!-- Intro -->
              <p style="margin:0 0 24px; font-size:15px; color:#374151; line-height:1.7;">
                ${isSigned
                  ? `Thank you for signing the managed sales service agreement for <strong>${dealership_name}</strong>. You can now list vehicles on our platform with our managed sales service.`
                  : `Thank you for your interest in our managed sales service for <strong>${dealership_name}</strong>. Your agreement is ready for review and signature.`
                }
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
                    <p style="margin:0; font-size:15px; color:#374151;">
                      <strong>Status:</strong> ${status.replace('_', ' ').toUpperCase()}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Info -->
              <p style="margin:0 0 28px; font-size:15px; color:#374151; line-height:1.7;">
                You can ${isSigned ? 'view' : 'review and sign'} your agreement at any time by clicking the button below.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${viewUrl}" style="display:inline-block; background:linear-gradient(135deg, #2563eb 0%, #10b981 100%); color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:700; font-size:15px;">
                      ${isSigned ? 'View Agreement' : 'Review & Sign Agreement'}
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