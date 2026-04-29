import * as React from 'react';

interface EmailTemplateProps {
  author_name: string;
  vehicle_title: string;
  vehicle_price?: number;
  vehicle_year?: number;
  vehicle_mileage?: number;
  vehicle_location?: string;
  vehicle_url: string;
  unsubscribe_url: string;
  unsubscribe_all_url: string;
}

export default function NewVehicleListingEmail({
  author_name,
  vehicle_title,
  vehicle_price,
  vehicle_year,
  vehicle_mileage,
  vehicle_location,
  vehicle_url,
  unsubscribe_url,
  unsubscribe_all_url,
}: EmailTemplateProps): string {

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${author_name} listed a new vehicle on Speedio</title>
</head>
<body style="margin:0; padding:40px 0; background-color:#f0f0f0; font-family:'Inter', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#eef0f5; border-radius:10px 10px 0 0; padding:30px 40px;">
              <h2 style="margin:0; font-size:22px; font-weight:600; color:#1e293b;">
                New Vehicle Listed by ${author_name}
              </h2>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:0 0 10px 10px; padding:32px 40px 36px; border:1px solid #e5e7eb; border-top:none;">

              <!-- Intro -->
              <p style="margin:0 0 20px; font-size:15px; color:#475569; line-height:1.6;">
                ${author_name}, someone you follow on Speedio, just listed a new vehicle!
              </p>

              <!-- Vehicle Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#f8fafc; border-left:4px solid #3b82f6; border-radius:8px; padding:20px 24px;">
                    <p style="margin:0 0 12px; font-size:17px; font-weight:700; color:#1e293b;">
                      ${vehicle_title}
                    </p>
                    ${vehicle_price !== undefined ? `
                    <p style="margin:0 0 6px; font-size:15px; color:#334155;">
                      <strong>Price:</strong> $${vehicle_price.toLocaleString()}
                    </p>` : ''}
                    ${vehicle_year !== undefined ? `
                    <p style="margin:0 0 6px; font-size:15px; color:#334155;">
                      <strong>Year:</strong> ${vehicle_year}
                    </p>` : ''}
                    ${vehicle_mileage !== undefined ? `
                    <p style="margin:0 0 6px; font-size:15px; color:#334155;">
                      <strong>Mileage:</strong> ${vehicle_mileage.toLocaleString()} miles
                    </p>` : ''}
                    ${vehicle_location ? `
                    <p style="margin:0; font-size:15px; color:#334155;">
                      <strong>Location:</strong> ${vehicle_location}
                    </p>` : ''}
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="${vehicle_url}" style="display:inline-block; background:linear-gradient(to right, #3b82f6, #10b981); color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-size:15px; font-weight:600;">
                      View Vehicle on Speedio
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="border-top:1px solid #e2e8f0; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Footer -->
              <p style="margin:0 0 8px; font-size:12px; color:#94a3b8;">
                You're receiving this email because you follow ${author_name} on Speedio.
              </p>
              <p style="margin:0; font-size:12px; color:#94a3b8;">
                <a href="${unsubscribe_url}" style="color:#64748b; text-decoration:underline;">Unsubscribe from vehicle notifications</a>
                &nbsp;|&nbsp;
                <a href="${unsubscribe_all_url}" style="color:#64748b; text-decoration:underline;">Unsubscribe from all emails</a>
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