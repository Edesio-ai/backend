import { escapeHtml, renderEmailLogo, type RenderedEmail } from '../../html';
import { CancelSubscriptionView } from '../types';

export function renderCancelSubscriptionTemplate(data: CancelSubscriptionView): RenderedEmail {
  const { logoUrl, profileUrl, year } = data;
  const firstname = escapeHtml(data.firstname);
  const planName = escapeHtml(data.planName);
  const endDate = escapeHtml(data.endDate);

  return {
    subject: "Confirmation d'annulation de votre abonnement Edesio",
    html: `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation d'annulation - Edesio</title>
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
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Confirmation d'annulation</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Votre abonnement a été annulé</h2>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Bonjour ${firstname},
                  </p>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Nous vous confirmons que votre abonnement <strong>${planName}</strong> a bien été annulé.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                    <tr>
                      <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0;">
                        <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">Important</p>
                        <p style="color: #92400e; font-size: 14px; margin: 8px 0 0 0;">
                          Vous conservez l'accès à toutes les fonctionnalités jusqu'au <strong>${endDate}</strong>.
                          Après cette date, votre accès sera suspendu.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                    Si vous changez d'avis, vous pouvez réactiver votre abonnement à tout moment depuis votre profil avant la date de fin.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                    <tr>
                      <td align="center">
                        <a href="${profileUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                          Accéder à mon profil
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                    Vous avez des questions ? Contactez-nous à <a href="mailto:contact@edesio.ai" style="color: #6366F1;">contact@edesio.ai</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                    &copy; ${year} Edesio - L'IA qui entraîne vos élèves
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
