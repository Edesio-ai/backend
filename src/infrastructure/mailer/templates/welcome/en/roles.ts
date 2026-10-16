import { WelcomeEmailRole } from '../types';

export const roleLabels: Record<WelcomeEmailRole, string> = {
  teacher: 'Teacher',
  student: 'Student',
  establishment: 'Institution',
};

export const quickStartItems: Record<WelcomeEmailRole, string[]> = {
  teacher: [
    'Create your first class session',
    'Add your lessons and PDF documents',
    'Generate questions with AI',
    'Share the session code with your students',
  ],
  establishment: [
    'Invite teachers to join your institution',
    'Track your teachers and sessions activity',
    "View your institution's overall statistics",
    'Manage invitation codes for new teachers',
  ],
  student: [
    "Join a session with your teacher's code",
    'Chat with Edesio to study',
    'Answer questions to progress',
    'Follow your ranking in the lesson',
  ],
};
