import { escapeHtml, renderEmailLogo, type RenderedEmail } from '../../html';
import { TeacherInvitationView } from '../types';

export function renderTeacherInvitationTemplate(data: TeacherInvitationView): RenderedEmail {
  const { logoUrl, signupUrl, availableChatbots } = data;
  const inviterName = escapeHtml(data.inviterName);
  const plural = availableChatbots > 1 ? 's' : '';
  const chatbotsBanner =
    availableChatbots > 0
      ? `
                <p style="color: #d97706; font-size: 14px; margin: 16px 0; padding: 12px; background-color: #fef3c7; border-radius: 8px;">
                  <strong>${availableChatbots} chatbot${plural}</strong> will be allocated to you to create your class sessions.
                </p>`
      : '';

  return {
    subject: `${data.inviterName} invites you to join Edesio`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to join Edesio</title>
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
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">You're invited!</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      <strong>${inviterName}</strong> invites you to join Edesio as a teacher.
                    </p>
                    ${chatbotsBanner}
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Click the button below to create your account and start using the platform.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center">
                          <a href="${signupUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                            Create my teacher account
                          </a>
                        </td>
                      </tr>
                    </table>
                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                      <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">With Edesio, you will be able to:</h3>
                      <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>Create your class sessions</li>
                        <li>Upload your lessons and PDF documents</li>
                        <li>Generate questions with AI</li>
                        <li>Share the session code with your students</li>
                        <li>Track each student's progress</li>
                      </ul>
                    </div>
                    <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0 0;">
                      This invitation link is valid for 7 days and can only be used once.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
                      Edesio - AI education solution for schools
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      If you did not request this invitation, you can ignore this email.
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
