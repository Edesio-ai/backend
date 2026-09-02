import { buildWelcomeEmailTemplateData } from './data';
import { renderWelcomeEmail } from './render';

describe('renderWelcomeEmail', () => {
  it('should render the French welcome email by default', () => {
    const data = buildWelcomeEmailTemplateData({
      name: 'Alex',
      role: 'teacher',
      appUrl: 'https://app.edesio.test',
      logoUrl: 'cid:edesio-logo',
    });

    const { html, subject } = renderWelcomeEmail(data);

    expect(subject).toContain('Bienvenue');
    expect(html).toContain('Bienvenue Alex');
    expect(html).toContain('Professeur');
    expect(html).toContain('https://app.edesio.test/teacher');
  });

  it('should render the English welcome email when locale is en', () => {
    const data = buildWelcomeEmailTemplateData({
      name: 'Alex',
      role: 'teacher',
      appUrl: 'https://app.edesio.test',
      logoUrl: 'cid:edesio-logo',
      locale: 'en',
    });

    const { html, subject } = renderWelcomeEmail(data);

    expect(subject).toContain('Welcome');
    expect(html).toContain('Welcome Alex');
    expect(html).toContain('Teacher');
  });
});
