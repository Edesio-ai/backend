import { escapeHtml, renderEmailLogo, type RenderedEmail } from '../../html';
import { WelcomeEmailView } from '../types';

export function renderWelcomeTemplate(data: WelcomeEmailView): RenderedEmail {
  const { logoUrl, dashboardUrl, appUrl, quickStartItemsHtml } = data;
  const name = escapeHtml(data.name);
  const roleLabel = escapeHtml(data.roleLabel);

  return {
    subject: `Bienvenue sur Edesio, ${data.name} !`,
    html: `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenue sur Edesio</title>
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
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">L'IA qui entraîne vos élèves et vous libère du temps</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Bienvenue ${name} !</h2>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Votre compte <strong>${roleLabel}</strong> a été créé avec succès. Vous êtes maintenant prêt(e) à utiliser Edesio !
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                    <tr>
                      <td align="center">
                        <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                          Accéder à mon espace
                        </a>
                      </td>
                    </tr>
                  </table>
                  <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">Pour commencer :</h3>
                    <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      ${quickStartItemsHtml}
                    </ul>
                  </div>
                  <div style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #c7d2fe;">
                    <h3 style="color: #3730a3; margin: 0 0 12px 0; font-size: 18px;">Installez l'application sur votre téléphone</h3>
                    <p style="color: #4338ca; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                      Accédez à Edesio directement depuis votre écran d'accueil !
                    </p>
                    <div style="margin-bottom: 12px;">
                      <strong style="color: #1f2937; font-size: 14px;">Sur iPhone (Safari) :</strong>
                      <p style="color: #4b5563; font-size: 13px; margin: 4px 0 0 0;">
                        1. Ouvrez <a href="${appUrl}" style="color: #6366F1;">${appUrl}</a><br>
                        2. Appuyez sur le bouton Partager (carré avec flèche)<br>
                        3. Sélectionnez "Sur l'écran d'accueil"
                      </p>
                    </div>
                    <div>
                      <strong style="color: #1f2937; font-size: 14px;">Sur Android (Chrome) :</strong>
                      <p style="color: #4b5563; font-size: 13px; margin: 4px 0 0 0;">
                        1. Ouvrez <a href="${appUrl}" style="color: #6366F1;">${appUrl}</a><br>
                        2. Appuyez sur le menu (trois points)<br>
                        3. Sélectionnez "Ajouter à l'écran d'accueil"
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
                    Edesio - Solution éducative IA pour établissements scolaires
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    Cet email a été envoyé suite à la création de votre compte.
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
