interface EmailTemplateProps {
  full_name: string;
  email: string;
  user_type: string;
  created_date: string;
  user_id: string;
  admin_panel_url?: string;
}

export default function AdminNewUserNotificationEmail({
  full_name,
  email,
  user_type,
  created_date,
  user_id,
  admin_panel_url = 'https://speedio.app/AdminPanel',
}: EmailTemplateProps): string {
  const registrationDate = new Date(created_date).toLocaleString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New User Registration on Speedio</title>
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
                New User Registration
              </h2>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Intro -->
              <p style="margin:0 0 20px; font-size:15px; color:#333333; line-height:1.6;">
                A new user has just registered on Speedio!
              </p>

              <!-- User Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:20px 24px;">
                    <p style="margin:0 0 14px; font-size:16px; font-weight:700; color:#111111;">User Details</p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Name:</strong> ${full_name || 'Not provided'}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Email:</strong> ${email}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Account Type:</strong> ${user_type || 'guest'}
                    </p>
                    <p style="margin:0 0 8px; font-size:15px; color:#333333;">
                      <strong>Registration Date:</strong> ${registrationDate}
                    </p>
                    <p style="margin:0; font-size:15px; color:#333333;">
                      <strong>User ID:</strong> ${user_id}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Admin Panel Link -->
              <p style="margin:0; font-size:14px; color:#64748b; line-height:1.6;">
                You can view this user in the
                <a href="${admin_panel_url}" style="color:#2563eb; text-decoration:none;">Admin Panel</a>.
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