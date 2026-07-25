import { WelcomeEmailTemplateData } from './welcome-email.types';

export function renderWelcomeEmailHtml(data: WelcomeEmailTemplateData): string {
  const quickStartItems = data.quickStartItems.map((item) => `      <li>${escapeHtml(item)}</li>`).join('\n');

  return `
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
                                
                                <!-- Header -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
                                        <img src="${data.logoUrl}" alt="Edesio" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Edesio</h1>
                                        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">L'IA qui entraine vos eleves et vous libere du temps</p>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Bienvenue ${escapeHtml(data.name)} !</h2>
                                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                        Votre compte <strong>${escapeHtml(data.roleLabel)}</strong> a ete cree avec succes. Vous etes maintenant pret(e) a utiliser Edesio !
                                    </p>
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                                        <tr>
                                        <td align="center">
                                            <a href="${data.appUrl}${data.dashboardPath}" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                                            Acceder a mon espace
                                            </a>
                                        </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Quick Start -->
                                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                                        <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">Pour commencer :</h3>
                                        <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
${quickStartItems}
                                        </ul>
                                    </div>
                                    
                                    <!-- Install App Section -->
                                    <div style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #c7d2fe;">
                                        <h3 style="color: #3730a3; margin: 0 0 12px 0; font-size: 18px;">Installez l'application sur votre telephone</h3>
                                        <p style="color: #4338ca; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                                            Accedez a Edesio directement depuis votre ecran d'accueil !
                                        </p>
                                        
                                        <div style="margin-bottom: 12px;">
                                            <strong style="color: #1f2937; font-size: 14px;">Sur iPhone (Safari) :</strong>
                                            <p style="color: #4b5563; font-size: 13px; margin: 4px 0 0 0;">
                                                1. Ouvrez <a href="${data.appUrl}" style="color: #6366F1;">${data.appUrl}</a><br>
                                                2. Appuyez sur le bouton Partager (carre avec fleche)<br>
                                                3. Selectionnez "Sur l'ecran d'accueil"
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <strong style="color: #1f2937; font-size: 14px;">Sur Android (Chrome) :</strong>
                                            <p style="color: #4b5563; font-size: 13px; margin: 4px 0 0 0;">
                                                1. Ouvrez <a href="${data.appUrl}" style="color: #6366F1;">${data.appUrl}</a><br>
                                                2. Appuyez sur le menu (trois points)<br>
                                                3. Selectionnez "Ajouter a l'ecran d'accueil"
                                            </p>
                                        </div>
                                    </div>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                                    <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
                                        Edesio - Solution educative IA pour etablissements scolaires
                                    </p>
                                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                        Cet email a ete envoye suite a la creation de votre compte.
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
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
