import type { IEmailProvider } from 'src/domain/email/contract/i-email.interface';

export function createMockEmailProvider(): jest.Mocked<IEmailProvider> {
  return {
    sendWelcomeEmail: jest.fn(),
    sendProfesseurInvitation: jest.fn(),
    sendCancelSubscriptionEmail: jest.fn(),
  };
}
