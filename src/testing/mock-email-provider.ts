import type { IEmailProvider } from 'src/domain/email/contract/i-email.interface';

export function createMockEmailProvider(): jest.Mocked<IEmailProvider> {
  return {
    sendWelcomeEmail: jest.fn(),
    sendTeacherInvitation: jest.fn(),
    sendCancelSubscriptionEmail: jest.fn(),
  };
}
