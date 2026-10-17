import { GenerateCompletionFeedbackLlmInput } from 'src/application/llm/generate-completion-feedback.use-case';
import { type Language } from 'src/domain/teaching/session/types/session.type';

const languageLabels: Record<Language, string> = {
  francais: 'français',
  anglais: 'anglais',
  espagnol: 'espagnol',
  allemand: 'allemand',
};

/** A response is imperfect as soon as its score is strictly below 1. */
const PERFECT_ANSWER_SCORE = 1;

export const getGenerateCompletionFeedbackSystemPrompt = (language: Language = 'francais'): string => {
  const langLabel = languageLabels[language] ?? language;
  return `
        Tu es un professeur bienveillant et pédagogue.
        Ton rôle est de générer un feedback de fin de quiz ET d'identifier les notions du cours à réviser.

        IMPORTANT: Tu dois TOUJOURS rédiger entièrement en ${langLabel} (langue du cours).
        Ne réponds jamais dans une autre langue.

        === ANALYSE ===
        1. Lis attentivement le CONTENU DU COURS (chapitres, notions, titres de sections si présents).
        2. Examine les réponses de l'élève (scores, éléments manquants, concepts faibles).
        3. Relie les difficultés de l'élève aux parties concrètes du cours (notions, chapitres, thèmes).
        4. Propose uniquement des notions ancrées dans le contenu du cours — pas d'inventions hors cours.

        === FEEDBACK ===
        - 2-3 phrases maximum
        - Toujours mentionner le sujet du cours
        - Ton chaleureux et adapté au résultat
        - Si des notions à réviser existent, mentionne-les brièvement de façon encourageante

        === NOTIONS À RÉVISER (OBLIGATOIRE SAUF 100%) ===
        - Une réponse est IMPARFAITE si son score < ${PERFECT_ANSWER_SCORE}
        - Le quiz est parfait UNIQUEMENT si le score global est 100% ET aucune réponse n'est imparfaite
        - Si le quiz N'EST PAS parfait : "notionsToReview" DOIT contenir 1 à 5 notions (jamais [])
        - Formulations courtes et actionnables (ex. "les causes de la Révolution", "chapitre sur les fractions")
        - Priorise les questions / concepts les moins réussis
        - Tableau vide UNIQUEMENT si le quiz est parfait à 100%
        - Toujours dans la langue du cours (${langLabel})

        === FORMAT DE RÉPONSE ===
        Réponds UNIQUEMENT avec un JSON valide, sans markdown ni texte autour.
        Les clés JSON DOIVENT être exactement "feedback" et "notionsToReview" (en anglais, camelCase).
        "notionsToReview" est TOUJOURS un tableau de strings.
        {
          "feedback": "message de fin",
          "notionsToReview": ["notion 1", "notion 2"]
        }
    `;
};

export const getGenerateCompletionFeedbackUserPrompt = (
  body: GenerateCompletionFeedbackLlmInput,
  feedbackContext: string,
  percent: number,
): string => {
  const { studentName, courseTitle, score, total, language = 'francais', courseContent, answers } = body;
  const langLabel = languageLabels[language] ?? language;

  const imperfectAnswers = answers.filter((answer) => answer.score < PERFECT_ANSWER_SCORE);
  const isPerfectQuiz = percent >= 100 && imperfectAnswers.length === 0;
  const notionsReminder = isPerfectQuiz
    ? `Quiz parfait à 100%. "notionsToReview" peut être [].`
    : `IMPORTANT: le quiz n'est PAS parfait (${percent}%, ${imperfectAnswers.length} réponse(s) imparfaite(s)). Tu DOIS remplir "notionsToReview" avec 1 à 5 notions du cours liées aux difficultés.`;

  const answersBlock =
    answers.length > 0
      ? answers
          .map((answer, index) => {
            const concepts =
              answer.concepts && answer.concepts.length > 0
                ? answer.concepts.map((c) => `${c.name} (${c.score})`).join(', ')
                : 'aucun';
            const missing =
              answer.missingElements && answer.missingElements.length > 0 ? answer.missingElements.join(', ') : 'aucun';
            const weakness = answer.score < PERFECT_ANSWER_SCORE ? 'IMPARFAIT' : 'OK';
            return [
              `${index + 1}. [${weakness}] Question : ${answer.questionText}`,
              `   Score : ${answer.score}`,
              answer.studentAnswer ? `   Réponse élève : ${answer.studentAnswer}` : null,
              `   Concepts : ${concepts}`,
              `   Éléments manquants : ${missing}`,
            ]
              .filter(Boolean)
              .join('\n');
          })
          .join('\n\n')
      : 'Aucune réponse détaillée fournie.';

  const courseBlock = courseContent.trim()
    ? courseContent
    : '(Aucun texte de cours fourni — base-toi sur les titres des questions et le titre du cours.)';

  return `
    ${studentName ? `Élève : ${studentName}` : 'Élève anonyme'}
    Cours : "${courseTitle}"
    Score : ${score}/${total} (${percent}%)
    Langue : ${langLabel}

    ${feedbackContext}
    ${notionsReminder}

    === CONTENU DU COURS ===
    ${courseBlock}

    === RÉPONSES DU QUIZ ===
    ${answersBlock}

    Analyse le cours et les réponses, puis génère le JSON en ${langLabel}.`;
};
