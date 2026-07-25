import { WelcomeEmailRole, WelcomeEmailTemplateData } from './welcome-email.types';

const ROLE_LABELS: Record<WelcomeEmailRole, string> = {
  teacher: 'Teacher',
  student: 'Student',
  establishment: 'Establishment',
  'self-learner': 'Self-learner',
};

const DASHBOARD_PATHS: Record<WelcomeEmailRole, string> = {
  teacher: '/teacher',
  student: '/student',
  establishment: '/establishment',
  'self-learner': '/self-learner',
};

const QUICK_START_ITEMS: Record<WelcomeEmailRole, string[]> = {
  teacher: [
    'Creez votre premiere session de classe',
    'Ajoutez vos cours et documents PDF',
    "Generez des questions avec l'IA",
    'Partagez le code de session avec vos eleves',
  ],
  establishment: [
    'Invitez des professeurs a rejoindre votre etablissement',
    "Suivez l'activite de vos professeurs et sessions",
    'Consultez les statistiques globales de votre etablissement',
    "Gerez les codes d'invitation pour les nouveaux professeurs",
  ],
  'self-learner': [
    'Creez vos propres cours et ajoutez du contenu',
    'Uploadez vos documents PDF',
    "Generez des questions avec l'IA",
    'Entrainez-vous avec le chatbot intelligent',
  ],
  student: [
    'Rejoignez une session avec le code de votre professeur',
    'Discutez avec Edesio pour reviser',
    'Repondez aux questions pour progresser',
    'Suivez votre classement dans le cours',
  ],
};

const ROLE_ALIASES: Record<string, WelcomeEmailRole> = {
  teacher: 'teacher',
  student: 'student',
  establishment: 'establishment',
  'self-learner': 'self-learner',
  selflearner: 'self-learner',
};

export function buildWelcomeEmailTemplateData(params: {
  role: string;
  name: string;
  appUrl: string;
  logoUrl: string;
}): WelcomeEmailTemplateData {
  const normalizedRole = normalizeRole(params.role);
  return {
    name: params.name,
    roleLabel: ROLE_LABELS[normalizedRole],
    dashboardPath: DASHBOARD_PATHS[normalizedRole],
    quickStartItems: QUICK_START_ITEMS[normalizedRole],
    appUrl: params.appUrl,
    logoUrl: params.logoUrl,
  };
}

function normalizeRole(role: string): WelcomeEmailRole {
  const key = role.toLowerCase().trim();
  return ROLE_ALIASES[key] ?? 'student';
}
