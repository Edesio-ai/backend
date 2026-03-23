import { Inject, Injectable } from "@nestjs/common";
import { Resend } from "resend";
import { EmailProviderInterface } from "../../interfaces/mailer/email.provider";
import { RESEND_CLIENT } from "./resend.module";
import { buildWelcomeEmailTemplateData } from "./templates/welcome/welcome-email.data";
import { renderWelcomeEmailHtml } from "./templates/welcome/welcome-email.renderer";
import { EmailSendingError } from "../../domain/email/errors";

const APP_URL = 'http://localhost:5000';
const LOGO_URL = `${APP_URL}/icon-192.png`;

@Injectable()
export class ResendEmailProvider implements EmailProviderInterface {
    constructor(@Inject(RESEND_CLIENT) private readonly resend: Resend) { }
    async sendWelcomeEmail(email: string, name: string, role: string): Promise<void> {
        const templateData = buildWelcomeEmailTemplateData({
            role,
            name,
            appUrl: APP_URL,
            logoUrl: LOGO_URL,
        });
        const html = renderWelcomeEmailHtml(templateData);

        try {
            const { error } = await this.resend.emails.send({
                from: 'Edesio <noreply@edesio.ai>',
                to: [email],
                subject: `Bienvenue sur Edesio, ${name} !`,
                html,
            });

            if (error) {
                throw new EmailSendingError(error.message);
            }
        } catch (err) {
            if (err instanceof EmailSendingError) {
                throw err;
            }
            const message = err instanceof Error ? err.message : String(err);
            throw new EmailSendingError(message);
        }
    }
}