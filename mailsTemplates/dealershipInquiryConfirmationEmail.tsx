interface DealershipInquiryConfirmationEmailProps {
  contact_name: string;
}

export default function DealershipInquiryConfirmationEmail({
  contact_name,
}: DealershipInquiryConfirmationEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thank You for Contacting Speedyo!</title>
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
                We've Got Your Inquiry! 
              </h1>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <p style="margin:0 0 16px; font-size:16px; color:#374151;">
                Hi <strong>${contact_name}</strong>,
              </p>

              <p style="margin:0 0 16px; font-size:15px; color:#374151; line-height:1.7;">
                Thank you for your interest in Speedyo's Managed Sales Service for Dealerships.
                We've received your inquiry and our team will review it shortly.
              </p>

              <p style="margin:0 0 20px; font-size:15px; color:#374151; line-height:1.7;">
                We typically respond within <strong>24–48 hours</strong> during business days.
              </p>

              <!-- Next Steps Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:20px 24px;">
                    <p style="margin:0 0 14px; font-size:14px; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">What Happens Next</p>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:6px 0; vertical-align:top;">
                          <span style="display:inline-block; background:linear-gradient(135deg, #2563eb, #10b981); color:#fff; border-radius:50%; width:22px; height:22px; text-align:center; line-height:22px; font-size:12px; font-weight:700; margin-right:10px;">1</span>
                        </td>
                        <td style="padding:6px 0; font-size:14px; color:#374151; line-height:1.6;">Our team will review your inquiry</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; vertical-align:top;">
                          <span style="display:inline-block; background:linear-gradient(135deg, #2563eb, #10b981); color:#fff; border-radius:50%; width:22px; height:22px; text-align:center; line-height:22px; font-size:12px; font-weight:700; margin-right:10px;">2</span>
                        </td>
                        <td style="padding:6px 0; font-size:14px; color:#374151; line-height:1.6;">We'll schedule a consultation call to discuss your needs</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; vertical-align:top;">
                          <span style="display:inline-block; background:linear-gradient(135deg, #2563eb, #10b981); color:#fff; border-radius:50%; width:22px; height:22px; text-align:center; line-height:22px; font-size:12px; font-weight:700; margin-right:10px;">3</span>
                        </td>
                        <td style="padding:6px 0; font-size:14px; color:#374151; line-height:1.6;">We'll create a customised plan for your dealership</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; vertical-align:top;">
                          <span style="display:inline-block; background:linear-gradient(135deg, #2563eb, #10b981); color:#fff; border-radius:50%; width:22px; height:22px; text-align:center; line-height:22px; font-size:12px; font-weight:700; margin-right:10px;">4</span>
                        </td>
                        <td style="padding:6px 0; font-size:14px; color:#374151; line-height:1.6;">You'll start reaching American buyers! 🎉</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

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