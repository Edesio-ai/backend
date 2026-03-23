export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER_INTERFACE');

export interface EmailProviderInterface {
    sendWelcomeEmail(email: string, name: string, role: string): Promise<void>;
}