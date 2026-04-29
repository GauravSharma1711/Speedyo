import * as React from 'react';

interface EmailTemplateProps {
  full_name: string;
  marketplace_url?: string;
  feed_url?: string;
}

export default function WelcomeEmail({
  full_name,
  marketplace_url = 'https://speedyo.app/marketplace',
  feed_url = 'https://speedyo.app/feed',
}: EmailTemplateProps): string {

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Speedyo!</title>
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
                Welcome to Speedyo! 🎉
              </h1>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Greeting -->
              <p style="margin:0 0 16px; font-size:16px; color:#374151;">
                Hi <strong>${full_name}</strong>,
              </p>

              <!-- Intro -->
              <p style="margin:0 0 16px; font-size:15px; color:#374151; line-height:1.7;">
                Welcome to Speedyo, the best place to buy and sell amazing vehicles. We're excited to have you join our community!
              </p>

              <!-- Links Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:20px 24px;">
                    <p style="margin:0 0 14px; font-size:15px; color:#374151; line-height:1.7;">
                      You can start by browsing our
                      <a href="${marketplace_url}" style="color:#2563eb; text-decoration:none; font-weight:600;">Marketplace</a>
                      or checking out the latest posts on the
                      <a href="${feed_url}" style="color:#2563eb; text-decoration:none; font-weight:600;">Feed</a>.
                    </p>
                    <p style="margin:0; font-size:15px; color:#374151;">
                      Happy driving! 🚗
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:12px;">
                          <a href="${marketplace_url}" style="display:inline-block; background:linear-gradient(135deg, #2563eb 0%, #10b981 100%); color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:700; font-size:15px;">
                            Browse Marketplace
                          </a>
                        </td>
                        <td>
                          <a href="${feed_url}" style="display:inline-block; background:#ffffff; color:#2563eb; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:700; font-size:15px; border:2px solid #2563eb;">
                            View Feed
                          </a>
                        </td>
                      </tr>
                    </table>
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