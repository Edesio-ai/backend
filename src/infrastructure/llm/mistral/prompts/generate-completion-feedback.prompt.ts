import { GenerateCompletionFeedbackBody } from 'src/application/llm/generate-completion-feedback.use-case';

export const getGenerateCompletionFeedbackSystemPrompt = (): string => {
  return `
        Tu es un professeur bienveillant et encourageant.
        Ton rôle est de générer des messages de fin de quiz personnalisés en français.
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
  const { studentName, courseTitle, score, total } = body;
  return `
    ${studentName ? `Élève : ${studentName}` : 'Élève anonyme'}
        Cours : "${courseTitle}"
        Score : ${score}/${total} (${percent}%)
        
        ${feedbackContext}

        Génère le message de fin.`;
};
