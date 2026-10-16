import { buildWelcomeEmailTemplateData } from './data';

describe('buildWelcomeEmailTemplateData', () => {
  const baseParams = {
    name: 'Alex Dupont',
    appUrl: 'https://app.test',
    logoUrl: 'https://cdn.test/logo.png',
  };

  it('maps student role', () => {
    const data = buildWelcomeEmailTemplateData({
      ...baseParams,
      role: 'student',
    });

    expect(data.name).toBe(baseParams.name);
    expect(data.appUrl).toBe(baseParams.appUrl);
    expect(data.logoUrl).toBe(baseParams.logoUrl);
    expect(data.roleLabel).toBe('Élève');
    expect(data.dashboardPath).toBe('/student');
    expect(data.quickStartItems.length).toBeGreaterThan(0);
    expect(data.quickStartItems[0]).toContain('session');
  });

  it('trims role and ignores case before mapping', () => {
    const data = buildWelcomeEmailTemplateData({
      ...baseParams,
      role: '  TEACHER ',
    });

    expect(data.dashboardPath).toBe('/teacher/sessions');
    expect(data.roleLabel).toBe('Professeur');
  });

  it('defaults unknown roles to student', () => {
    const data = buildWelcomeEmailTemplateData({
      ...baseParams,
      role: 'alien-role',
    });

    expect(data.dashboardPath).toBe('/student');
    expect(data.roleLabel).toBe('Élève');
  });

  it('uses English role labels when locale is en', () => {
    const data = buildWelcomeEmailTemplateData({
      ...baseParams,
      role: 'teacher',
      locale: 'en',
    });

    expect(data.roleLabel).toBe('Teacher');
    expect(data.quickStartItems[0]).toContain('session');
  });

  it('maps establishment dashboard path', () => {
    const data = buildWelcomeEmailTemplateData({
      ...baseParams,
      role: 'establishment',
    });

    expect(data.dashboardPath).toBe('/establishment/overview');
    expect(data.roleLabel).toBe('Établissement');
  });
});
