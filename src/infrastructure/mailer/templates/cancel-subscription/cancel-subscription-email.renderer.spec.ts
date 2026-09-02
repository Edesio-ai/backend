import { renderCancelSubscriptionEmail } from './render';

describe('renderCancelSubscriptionEmail', () => {
  const params = {
    email: 'user@test.com',
    firstname: 'Claire',
    planName: 'Offre Pro',
    endDate: '15 février 2026',
  };

  describe('when FRONTEND_URL is set', () => {
    const originalFrontendUrl = process.env.FRONTEND_URL;

    beforeEach(() => {
      process.env.FRONTEND_URL = 'https://app.edesio.test';
    });

    afterEach(() => {
      process.env.FRONTEND_URL = originalFrontendUrl;
    });

    it('should include greeting, plan, end date and profile links from env base URL', () => {
      const { html, subject } = renderCancelSubscriptionEmail(params);

      expect(subject).toContain('annulation');
      expect(html).toContain('Bonjour Claire');
      expect(html).toContain('Offre Pro');
      expect(html).toContain('15 février 2026');
      expect(html).toContain('https://app.edesio.test/profile');
      expect(html).toContain('cid:edesio-logo');
      expect(html).toContain('contact@edesio.ai');
    });

    it('should render the English template when locale is en', () => {
      const { html, subject } = renderCancelSubscriptionEmail({ ...params, locale: 'en' });

      expect(subject).toContain('cancellation');
      expect(html).toContain('Hello Claire');
      expect(html).toContain('Go to my profile');
    });
  });

  describe('when FRONTEND_URL is unset', () => {
    const originalFrontendUrl = process.env.FRONTEND_URL;

    beforeEach(() => {
      delete process.env.FRONTEND_URL;
    });

    afterEach(() => {
      process.env.FRONTEND_URL = originalFrontendUrl;
    });

    it('should fall back to localhost default for assets and CTA', () => {
      const { html } = renderCancelSubscriptionEmail(params);

      expect(html).toContain('http://localhost:5000/profile');
      expect(html).toContain('cid:edesio-logo');
    });
  });
});
