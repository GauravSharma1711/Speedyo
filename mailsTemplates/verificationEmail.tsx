interface EmailTemplateProps {
  full_name: string;
  otp: string;
}

export default function VerificationEmail({ full_name, otp }: EmailTemplateProps): string {
  const otpDigits = otp.split("").join(" ");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email</title>
</head>
<body style="margin:0; padding:40px 0; background-color:#f0f0f0; font-family:'Inter', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#eef0f5; border-radius:10px 10px 0 0; padding:36px 40px; text-align:center;">
              <h1 style="margin:0; font-size:28px; font-weight:400; color:#111111; letter-spacing:-0.5px;">
                Verify your email
              </h1>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px;">

              <!-- Greeting -->
              <p style="margin:0 0 12px; font-size:15px; color:#111111;">
                Hey ${full_name},
              </p>

              <!-- Description -->
              <p style="margin:0 0 28px; font-size:15px; color:#111111; line-height:1.6;">
                Welcome to Speedyo. Please verify your email address to complete your registration.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#f7f8fa; border-radius:8px; padding:24px 20px; text-align:center;">
                    <p style="margin:0 0 14px; font-size:14px; color:#555555;">
                      Your verification code
                    </p>
                    <p style="margin:0; font-size:42px; font-weight:400; color:#e85d1e; letter-spacing:10px; font-family:monospace;">
                      ${otpDigits}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Expiry -->
              <p style="margin:0 0 32px; font-size:14px; color:#333333; line-height:1.6;">
                This code will expire in <strong>10 minutes</strong>, so be sure to use it soon.
              </p>

              <!-- Signature -->
              <p style="margin:0; font-size:14px; color:#333333; line-height:1.8;">
                See you there,<br/>
                The Speedyo team
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