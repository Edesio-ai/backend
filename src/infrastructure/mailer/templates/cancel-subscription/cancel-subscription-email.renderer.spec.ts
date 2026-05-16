import { renderCancelSubscriptionEmailHtml } from './cancel-subscription-email.renderer';

describe('renderCancelSubscriptionEmailHtml', () => {
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
      const html = renderCancelSubscriptionEmailHtml(params);

      expect(html).toContain('Bonjour Claire');
      expect(html).toContain('Offre Pro');
      expect(html).toContain('15 février 2026');
      expect(html).toContain('https://app.edesio.test/icon-192.png');
      expect(html).toContain('https://app.edesio.test/profil');
      expect(html).toContain('contact@edesio.ai');
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
      const html = renderCancelSubscriptionEmailHtml(params);

      expect(html).toContain('http://localhost:5000/icon-192.png');
      expect(html).toContain('http://localhost:5000/profil');
    });
  });
});
