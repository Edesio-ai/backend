import { ProfesseurInvitationTemplateData } from "./professeur-invitation-email.types";

export function renderProfesseurInvitationEmailHtml(data: ProfesseurInvitationTemplateData): string {
  const chatbotsText =
    data.availableChatbots > 0
      ? `<p style="color: #d97706; font-size: 14px; margin: 16px 0; padding: 12px; background-color: #fef3c7; border-radius: 8px;">
        <strong>${data.availableChatbots} chatbot${data.availableChatbots > 1 ? "s" : ""}</strong> vous seront alloues pour creer vos sessions de classe.
      </p>`
      : "";

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation a rejoindre Edesio</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
                    <img src="${data.logoUrl}" alt="Edesio" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Edesio</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">L'IA qui entraine vos eleves et vous libere du temps</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Vous etes invite(e) !</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      <strong>${escapeHtml(data.inviterName)}</strong> vous invite a rejoindre Edesio en tant que professeur.
                    </p>

                    ${chatbotsText}
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Cliquez sur le bouton ci-dessous pour creer votre compte et commencer a utiliser la plateforme.
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center">
                          <a href="${data.signupUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                            Creer mon compte professeur
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                      <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">Avec Edesio, vous pourrez :</h3>
                      <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>Creer vos sessions de classe</li>
                        <li>Uploader vos cours et documents PDF</li>
                        <li>Generer des questions avec l'IA</li>
                        <li>Partager le code de session avec vos eleves</li>
                        <li>Suivre la progression de chaque eleve</li>
                      </ul>
                    </div>
                    <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0 0;">
                      Ce lien d'invitation est valable 7 jours et ne peut etre utilise qu'une seule fois.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
                      Edesio - Solution educative IA pour etablissements scolaires
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      Si vous n'avez pas demande cette invitation, vous pouvez ignorer cet email.
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}