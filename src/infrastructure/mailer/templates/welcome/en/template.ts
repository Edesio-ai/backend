import { escapeHtml, renderEmailLogo, type RenderedEmail } from '../../html';
import { WelcomeEmailView } from '../types';

export function renderWelcomeTemplate(data: WelcomeEmailView): RenderedEmail {
  const { logoUrl, dashboardUrl, appUrl, quickStartItemsHtml } = data;
  const name = escapeHtml(data.name);
  const roleLabel = escapeHtml(data.roleLabel);

  return {
    subject: `Welcome to Edesio, ${data.name}!`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Edesio</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background-color: #ffffff; padding: 32px 30px 16px 30px; text-align: center;">
                  ${renderEmailLogo(logoUrl)}
                </td>
              </tr>
              <tr>
                <td style="background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%); padding: 24px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Edesio</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">The AI that trains your students and frees up your time</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Welcome ${name}!</h2>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Your <strong>${roleLabel}</strong> account has been created successfully. You are now ready to use Edesio!
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                    <tr>
                      <td align="center">
                        <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                          Go to my workspace
                        </a>
                      </td>
                    </tr>
                  </table>
                  <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">To get started:</h3>
                    <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      ${quickStartItemsHtml}
                    </ul>
                  </div>
                  <div style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #c7d2fe;">
                    <h3 style="color: #3730a3; margin: 0 0 12px 0; font-size: 18px;">Install the app on your phone</h3>
                    <p style="color: #4338ca; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                      Access Edesio directly from your home screen!
                    </p>
                    <div style="margin-bottom: 12px;">
                      <strong style="color: #1f2937; font-size: 14px;">On iPhone (Safari):</strong>
                      <p style="color: #4b5563; font-size: 13px; margin: 4px 0 0 0;">
                        1. Open <a href="${appUrl}" style="color: #6366F1;">${appUrl}</a><br>
                        2. Tap the Share button (square with arrow)<br>
                        3. Select "Add to Home Screen"
                      </p>
                    </div>
                    <div>
                      <strong style="color: #1f2937; font-size: 14px;">On Android (Chrome):</strong>
                      <p style="color: #4b5563; font-size: 13px; margin: 4px 0 0 0;">
                        1. Open <a href="${appUrl}" style="color: #6366F1;">${appUrl}</a><br>
                        2. Tap the menu (three dots)<br>
                        3. Select "Add to Home screen"
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
                    Edesio - AI education solution for schools
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    This email was sent after your account was created.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `,
  };
}
