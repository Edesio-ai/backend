import { QuestionGenerationConfig } from 'src/domain/llm/types/openai.type';

export const getGenerateQuestionSystemPrompt = (
  config: QuestionGenerationConfig,
): string => {
  const { totalQuestions, language } = config;
  return `
    Tu es un professeur expert en pédagogie. Tu génères des questions pédagogiques pertinentes à partir du contenu des PDF, comme le ferait un vrai professeur expérimenté. Tu dois générer exactement ${totalQuestions} questions couvrant les ${totalQuestions} sujets PRINCIPAUX du cours. Tu réponds toujours en JSON valide. Tu génères les questions en ${language}. Important: le contenu du cours peut être dans une autre langue, mais tu dois TOUJOURS générer les questions et réponses en ${language}.
    `;
};

export const getGenerateQuestionUserPrompt = (
  config: QuestionGenerationConfig,
  truncatedContent: string,
  existingQuestionsContext: string,
): string => {
  const { totalQuestions, singleCount, openedCount, language } = config;

  return `À partir de ce contenu de cours, génère exactement ${totalQuestions} questions pédagogiques en ${language}.

    RÈGLES DE GÉNÉRATION ESSENTIELLES :
    1. Analyse le contenu pour identifier les ${totalQuestions} SUJETS PRINCIPAUX du cours
    2. Chaque question doit porter sur un sujet PRINCIPAL DIFFÉRENT - couvre les éléments les plus importants, pas les détails secondaires
    3. ÉVITE les détails anecdotiques, les dates précises, les noms propres secondaires
    4. Questions SIMPLES et CLAIRES - formule-les comme un professeur qui parle naturellement
    5. Réponses LOGIQUES et NATURELLES - les bonnes réponses doivent être dites de façon simple, pas académique ou compliquée
    
    RÈGLE CRITIQUE - COHÉRENCE FACTUELLE :
    - Ne génère JAMAIS deux questions différentes avec des réponses contradictoires sur le même sujet
    - Si le document mentionne un fait précis (ex: "le début de X est Y"), utilise TOUJOURS cette information comme base
    - En cas d'ambiguïté dans le document, choisis l'interprétation la plus communément acceptée
    - Chaque question doit avoir UNE SEULE réponse correcte, pas d'ambiguïté
    
    RÈGLE ANTI-DUPLICATION :
    - Ne génère PAS de questions qui se ressemblent ou portent sur le même concept
    - Chaque question doit être UNIQUE et couvrir un aspect DIFFÉRENT du cours
    - Évite les formulations quasi-identiques ("Quel est X ?" et "Qu'est-ce que X ?" sur le même sujet)
    
    RÈGLE DE VARIÉTÉ :
    - Explore des angles et sections différents du cours à chaque génération
    - Ne te concentre pas toujours sur les mêmes concepts ou le début du cours
    - Varie les formulations, les angles d'approche et les niveaux de difficulté
    
    RÉPARTITION :
    - ${singleCount} questions de type "single"
    - ${openedCount} questions de type "open" (réponse courte)
    
    RÈGLES SPÉCIFIQUES QCM :
    - Chaque QCM comporte 1 SEULE bonne réponse
    - TOUJOURS exactement 4 propositions
    - IMPORTANT : NE PAS inclure les lettres (A, B, C, D) dans les propositions - elles seront ajoutées automatiquement
    - Les distracteurs (mauvaises réponses) doivent être PLAUSIBLES : ce sont des erreurs fréquentes que font les élèves
    - Ne pas utiliser de pièges artificiels ou de formulations trompeuses
    - Les QCM doivent tester la COMPRÉHENSION, pas la mémorisation brute
    - Inclure une justification interne expliquant pourquoi c'est la bonne réponse (non affichée à l'élève)
    
    RÈGLES QUESTIONS OUVERTES :
    - Questions courtes et simples testant la compréhension d'un concept principal
    - La réponse attendue doit être concise, claire et formulée naturellement (comme on répondrait à l'oral)
    - Évite les réponses trop longues ou trop académiques
    
    Retourne un objet JSON avec la structure suivante :
    {
      "questions": [
        {
          "type": "single",
          "questionText": "Intitulé de la question",
          "keyConcepts": ["Concept 1", "Concept 2", "Concept 3"],
          "proposals": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
          "correctAnswers": ["Réponse exacte parmi les propositions"],
          "justification": "Explication interne de pourquoi c'est la bonne réponse",
          "explanation": "Explication courte pour l'élève (3 lignes max)"
        },
        {
          "type": "open",
          "questionText": "Intitulé de la question ouverte",
          "keyConcepts": ["Concept 1", "Concept 2", "Concept 3"],
          "correctAnswers": ["Réponse attendue"],
          "proposals": [],
          "explanation": "Explication courte pour l'élève (3 lignes max)"
        }
      ]
    }
    
    Contenu du cours :
    ${truncatedContent}${existingQuestionsContext}`;
};
