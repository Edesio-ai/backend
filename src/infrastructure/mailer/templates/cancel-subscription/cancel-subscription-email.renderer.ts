import { CancelSubscriptionEmailParams } from 'src/domain/billing/types/billing.type';

export function renderCancelSubscriptionEmailHtml(
  data: CancelSubscriptionEmailParams,
): string {
  const { planName, endDate, firstname } = data;
  const APP_URL = process.env.FRONTEND_URL || 'http://localhost:5000';
  const LOGO_URL = `${APP_URL}/icon-192.png`;
  return `
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
                
                <!-- Header -->
                <tr>
                    <td style="background: linear-gradient(135deg, #6b7280 0%, #374151 100%); padding: 40px 30px; text-align: center;">
                    <img src="${LOGO_URL}" alt="Edesio" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Edesio</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Confirmation d'annulation</p>
                    </td>
                </tr>
                
                <!-- Content -->
                <tr>
                    <td style="padding: 40px 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Votre abonnement a été annulé</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        Bonjour ${firstname},
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        Nous vous confirmons que votre abonnement <strong>${planName}</strong> a bien été annulé.
                    </p>
                    
                    <!-- Info Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                        <tr>
                        <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0;">
                            <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
                            Important
                            </p>
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
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                        <tr>
                        <td align="center">
                            <a href="${APP_URL}/profil" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
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
                
                <!-- Footer -->
                <tr>
                    <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                        &copy; ${new Date().getFullYear()} Edesio - L'IA qui entraîne vos élèves
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
