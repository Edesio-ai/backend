import { escapeHtml, renderEmailLogo, type RenderedEmail } from '../../html';
import { CancelSubscriptionView } from '../types';

export function renderCancelSubscriptionTemplate(data: CancelSubscriptionView): RenderedEmail {
  const { logoUrl, profileUrl, year } = data;
  const firstname = escapeHtml(data.firstname);
  const planName = escapeHtml(data.planName);
  const endDate = escapeHtml(data.endDate);

  return {
    subject: 'Confirmation of your Edesio subscription cancellation',
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cancellation confirmation - Edesio</title>
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
                <td style="background: linear-gradient(135deg, #6b7280 0%, #374151 100%); padding: 24px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Edesio</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Cancellation confirmation</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Your subscription has been cancelled</h2>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Hello ${firstname},
                  </p>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    We confirm that your <strong>${planName}</strong> subscription has been cancelled.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                    <tr>
                      <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0;">
                        <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">Important</p>
                        <p style="color: #92400e; font-size: 14px; margin: 8px 0 0 0;">
                          You keep access to all features until <strong>${endDate}</strong>.
                          After this date, your access will be suspended.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                    If you change your mind, you can reactivate your subscription at any time from your profile before the end date.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                    <tr>
                      <td align="center">
                        <a href="${profileUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                          Go to my profile
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                    Have questions? Contact us at <a href="mailto:contact@edesio.ai" style="color: #6366F1;">contact@edesio.ai</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                    &copy; ${year} Edesio - The AI that trains your students
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
