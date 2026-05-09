// mailsTemplates/reset-password.ts

interface ResetPasswordEmailProps {
  full_name: string;
  reset_link: string;
}

export default function ResetPasswordEmail({
  full_name,
  reset_link,
}: ResetPasswordEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
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
                Reset your password
              </h1>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Greeting -->
              <p style="margin:0 0 16px; font-size:16px; color:#374151;">
                Hey ${full_name},
              </p>

              <!-- Intro -->
              <p style="margin:0 0 24px; font-size:15px; color:#374151; line-height:1.7;">
                We received a request to reset your password. If that was you, click the button below to choose a new one.
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
                <tr>
                  <td align="center">
                    <a
                      href="${reset_link}"
                      style="display:inline-block; background:#111827; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:999px; font-weight:600; font-size:14px;"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Reset password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 18px; font-size:13px; color:#6b7280; line-height:1.7; text-align:center;">
                If the button above doesn't work, you can copy and paste this link into your browser:
                <br/>
              </p>

              <p style="margin:0 0 28px; font-size:13px; color:#6b7280; line-height:1.7; text-align:center;">
                For your security, this link will expire in <strong>1 hour</strong>.
              </p>

              <!-- Warning -->
              <p style="margin:0 0 28px; font-size:14px; color:#6b7280; line-height:1.7;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>

              <!-- Sign off -->
              <p style="margin:0; font-size:14px; color:#6b7280; line-height:1.8;">
                Stay secure,<br/>
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