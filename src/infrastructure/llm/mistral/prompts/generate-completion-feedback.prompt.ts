import { GenerateCompletionFeedbackBody } from 'src/application/llm/generate-completion-feedback.use-case';
import { type Language } from 'src/domain/teaching/session/types/session.type';

const languageLabels: Record<Language, string> = {
  francais: 'français',
  anglais: 'anglais',
  espagnol: 'espagnol',
  allemand: 'allemand',
};

export const getGenerateCompletionFeedbackSystemPrompt = (language: Language = 'francais'): string => {
  const langLabel = languageLabels[language] ?? language;
  return `
        Tu es un professeur bienveillant et encourageant.
        Ton rôle est de générer des messages de fin de quiz personnalisés.
        IMPORTANT: Tu dois TOUJOURS rédiger le message entièrement en ${langLabel} (langue du cours).
        Ne réponds jamais dans une autre langue.
        Règles absolues :
        - 2-3 phrases maximum
        - Toujours mentionner le sujet du cours
        - Ton chaleureux et adapté au résultat
        - Répondre uniquement avec le message, sans guillemets ni formatage
    `;
};

export const getGenerateCompletionFeedbackUserPrompt = (
  body: GenerateCompletionFeedbackBody,
  feedbackContext: string,
  percent: number,
): string => {
  const { studentName, courseTitle, score, total, language = 'francais' } = body;
  const langLabel = languageLabels[language] ?? language;
  return `
    ${studentName ? `Élève : ${studentName}` : 'Élève anonyme'}
        Cours : "${courseTitle}"
        Score : ${score}/${total} (${percent}%)
        Langue du message : ${langLabel}
        
        ${feedbackContext}

        Génère le message de fin en ${langLabel}.`;
};
