import { renderTeacherInvitationEmail } from './render';
import { buildTeacherInvitationTemplateData } from './data';

describe('renderTeacherInvitationEmail', () => {
  const data = buildTeacherInvitationTemplateData({
    inviterName: 'Lycée Pasteur',
    invitationToken: 'tok-abc',
    availableChatbots: 2,
    appUrl: 'https://app.edesio.test',
    logoUrl: 'cid:edesio-logo',
  });

  it('should render the French template by default', () => {
    const { html, subject } = renderTeacherInvitationEmail(data);

    expect(subject).toContain('vous invite');
    expect(html).toContain('Lycée Pasteur');
    expect(html).toContain('2 chatbots');
    expect(html).toContain('/register/teacher-invitation/tok-abc');
  });

  it('should render the English template when locale is en', () => {
    const { html, subject } = renderTeacherInvitationEmail({
      ...data,
      locale: 'en',
    });

    expect(subject).toContain('invites you');
    expect(html).toContain('will be allocated');
  });
});
