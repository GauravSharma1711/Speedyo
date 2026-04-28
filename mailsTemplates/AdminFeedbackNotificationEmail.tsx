import * as React from 'react';

interface EmailTemplateProps {
  user_name?: string;
  user_email?: string;
  rating: number;
  category: string;
  feedback_text: string;
  admin_panel_url?: string;
}

export default function AdminFeedbackNotificationEmail({
  user_name,
  user_email,
  rating,
  category,
  feedback_text,
  admin_panel_url = 'https://speedio.app/AdminPanel',
}: EmailTemplateProps): string {
  const ratingPercent = ((rating / 5) * 100).toFixed(0);
  const submittedAt = new Date().toLocaleString();
  const displayName = user_name || 'Anonymous';
  const displayEmail = user_email ? ` (${user_email})` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Feedback Received - ${rating}/5 Stars</title>
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
                New User Feedback
              </h2>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:20px 24px;">
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>User:</strong> ${displayName}${displayEmail}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Satisfaction Rating:</strong> ${rating}/5 stars (${ratingPercent}%)
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Category:</strong> ${category}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Submitted:</strong> ${submittedAt}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feedback Text Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px; font-size:15px; color:#333333;">
                      <strong>Feedback:</strong>
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#ffffff; border-left:4px solid #2563eb; border:1px solid #e5e7eb; border-radius:4px; padding:16px 20px;">
                          <p style="margin:0; font-size:15px; color:#334155; line-height:1.7; white-space:pre-wrap;">
                            ${feedback_text}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Admin Panel Link -->
              <p style="margin:0; font-size:14px; color:#64748b; line-height:1.6;">
                View all feedback in the
                <a href="${admin_panel_url}" style="color:#2563eb; text-decoration:none; font-weight:600;">Admin Panel</a>.
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