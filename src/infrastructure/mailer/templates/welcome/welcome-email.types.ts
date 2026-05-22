export type WelcomeEmailRole =
  | 'teacher'
  | 'student'
  | 'establishment'
  | 'self-learner';

export type WelcomeEmailTemplateData = {
  name: string;
  roleLabel: string;
  dashboardPath: string;
  quickStartItems: string[];
  appUrl: string;
  logoUrl: string;
};
