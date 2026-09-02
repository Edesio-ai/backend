import { WelcomeEmailRole } from '../types';

export const roleLabels: Record<WelcomeEmailRole, string> = {
  teacher: 'Professeur',
  student: 'Élève',
  establishment: 'Établissement',
  'self-learner': 'Autodidacte',
};

export const quickStartItems: Record<WelcomeEmailRole, string[]> = {
  teacher: [
    'Créez votre première session de classe',
    'Ajoutez vos cours et documents PDF',
    "Générez des questions avec l'IA",
    'Partagez le code de session avec vos élèves',
  ],
  establishment: [
    'Invitez des professeurs à rejoindre votre établissement',
    "Suivez l'activité de vos professeurs et sessions",
    'Consultez les statistiques globales de votre établissement',
    "Gérez les codes d'invitation pour les nouveaux professeurs",
  ],
  'self-learner': [
    'Créez vos propres cours et ajoutez du contenu',
    'Uploadez vos documents PDF',
    "Générez des questions avec l'IA",
    'Entraînez-vous avec le chatbot intelligent',
  ],
  student: [
    'Rejoignez une session avec le code de votre professeur',
    'Discutez avec Edesio pour réviser',
    'Répondez aux questions pour progresser',
    'Suivez votre classement dans le cours',
  ],
};
