import { buildWelcomeEmailTemplateData } from './welcome-email.data';

describe('buildWelcomeEmailTemplateData', () => {
  const baseParams = {
    name: 'Alex Dupont',
    appUrl: 'https://app.test',
    logoUrl: 'https://cdn.test/logo.png',
  };

  it('maps self-learner role when slug uses a hyphen', () => {
    const data = buildWelcomeEmailTemplateData({
      ...baseParams,
      role: 'self-learner',
    });

    expect(data.name).toBe(baseParams.name);
    expect(data.appUrl).toBe(baseParams.appUrl);
    expect(data.logoUrl).toBe(baseParams.logoUrl);
    expect(data.roleLabel).toBe('Self-learner');
    expect(data.dashboardPath).toBe('/self-learner');
    expect(data.quickStartItems.length).toBeGreaterThan(0);
    expect(data.quickStartItems[0]).toContain('cours');
  });

  it('aliases lowercase selfLearner-style input to self-learner role', () => {
    const data = buildWelcomeEmailTemplateData({
      ...baseParams,
      role: 'selfLearner',
    });

    expect(data.dashboardPath).toBe('/self-learner');
    expect(data.roleLabel).toBe('Self-learner');
  });

  it('trims role and ignores case before mapping', () => {
    const data = buildWelcomeEmailTemplateData({
      ...baseParams,
      role: '  TEACHER ',
    });

    expect(data.dashboardPath).toBe('/teacher');
    expect(data.roleLabel).toBe('Teacher');
  });

  it('defaults unknown roles to student', () => {
    const data = buildWelcomeEmailTemplateData({
      ...baseParams,
      role: 'alien-role',
    });

    expect(data.dashboardPath).toBe('/student');
    expect(data.roleLabel).toBe('Student');
  });
});
