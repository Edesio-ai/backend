import { Inject, Injectable } from '@nestjs/common';
import { GeneratedQuestion, QuestionGenerationConfig } from 'src/domain/llm/types/openai.type';
import type { ILlmProvider as MistralRepositoryContract } from 'src/domain/llm/contracts/I-llm.provider';
import { getGenerateQuestionSystemPrompt, getGenerateQuestionUserPrompt } from './prompts/generate-question.prompt';
import { getEvaluateAnswerSystemPrompt, getEvaluateAnswerUserPrompt } from './prompts/evaluate-answer.prompt';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { EvaluateAnswerBody } from 'src/application/llm/evaluate-answer.use-case';
import { EvaluateAnswerResponse, LlmCompletionFeedbackResult } from 'src/domain/llm/types/openai.type';
import { GenerateCompletionFeedbackLlmInput } from 'src/application/llm/generate-completion-feedback.use-case';
import { getGenerateCompletionFeedbackSystemPrompt } from './prompts/generate-completion-feedback.prompt';
import { getGenerateCompletionFeedbackUserPrompt } from './prompts/generate-completion-feedback.prompt';
import { MISTRAL_CLIENT } from './mistral.constants';
import { Mistral } from '@mistralai/mistralai';

const COURSE_CONTENT_MAX_CHARS = 15000;

@Injectable()
export class MistralProvider implements MistralRepositoryContract {
  constructor(
    @Inject(MISTRAL_CLIENT)
    private readonly mistral: Mistral,
  ) {}

  public async generateQuestions(
    courseContent: string,
    config: QuestionGenerationConfig,
    existingQuestions?: string[],
  ): Promise<GeneratedQuestion[]> {
    const maxChars = 15000;
    const truncatedContent =
      courseContent.length > maxChars
        ? courseContent.substring(0, maxChars) + '\n\n[Contenu tronqué pour respecter la limite]'
        : courseContent;

    const existingQuestionsContext =
      existingQuestions && existingQuestions.length > 0
        ? `\n\nQUESTIONS DÉJÀ EXISTANTES (NE PAS CRÉER DE DOUBLONS NI DE QUESTIONS SIMILAIRES) :\n${existingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n`
        : '';

    const systemPrompt = getGenerateQuestionSystemPrompt(config);
    const userPrompt = getGenerateQuestionUserPrompt(config, truncatedContent, existingQuestionsContext);

    const response = await this.mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 6000,
      responseFormat: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content as string;

    if (!content) {
      throw new ServerError('No response from OpenAI');
    }

    return JSON.parse(content).questions;
  }

  public async evaluateAnswer(body: EvaluateAnswerBody): Promise<EvaluateAnswerResponse> {
    const systemPrompt = getEvaluateAnswerSystemPrompt(body.language);
    const userPrompt = getEvaluateAnswerUserPrompt(body);

    const response = await this.mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      maxTokens: 500,
      responseFormat: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content as string;
    if (!content) {
      throw new ServerError('No response from OpenAI');
    }

    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const evaluation = JSON.parse(cleanedContent);
    const rawConcepts = Array.isArray(evaluation.concepts) ? evaluation.concepts : [];

    return {
      score: evaluation.score,
      feedback: evaluation.feedback,
      concepts: rawConcepts.map((concept: { name?: string; nom?: string; score?: number }) => ({
        name: concept.name ?? concept.nom ?? '',
        score: Number(concept.score ?? 0),
      })),
      missingElements: evaluation.missingElements || [],
      correctAnswer: body.correctAnswer,
    };
  }

  public async generateCompletionFeedback(
    body: GenerateCompletionFeedbackLlmInput,
  ): Promise<LlmCompletionFeedbackResult> {
    try {
      const { total, score } = body;

      const percent = total > 0 ? Math.round((score / total) * 100) : 0;

      const feedbackContext =
        percent >= 100
          ? "L'élève a réussi parfaitement. Félicite-le chaleureusement. notionsToReview peut être []."
          : percent >= 70
            ? "L'élève a bien réussi mais ce n'est pas 100%. Félicite-le et propose quand même les notions à retravailler."
            : percent >= 50
              ? "L'élève a un résultat moyen. Encourage-le et oriente-le vers les notions du cours à revoir."
              : "L'élève a eu des difficultés. Motive-le positivement et indique clairement les notions du cours à réviser.";

      const language = body.language ?? 'francais';
      const truncatedCourseContent =
        body.courseContent.length > COURSE_CONTENT_MAX_CHARS
          ? body.courseContent.substring(0, COURSE_CONTENT_MAX_CHARS) + '\n\n[Contenu tronqué pour respecter la limite]'
          : body.courseContent;

      const systemPrompt = getGenerateCompletionFeedbackSystemPrompt(language);
      const userPrompt = getGenerateCompletionFeedbackUserPrompt(
        { ...body, courseContent: truncatedCourseContent, language },
        feedbackContext,
        percent,
      );

      const response = await this.mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        maxTokens: 400,
        responseFormat: { type: 'json_object' },
      });

      const content = (response.choices[0]?.message?.content as string) || '';
      if (!content) {
        return {
          feedback: 'Bravo pour avoir terminé ce quiz !',
          notionsToReview: [],
        };
      }

      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      try {
        const parsed = JSON.parse(cleanedContent) as Record<string, unknown>;
        const feedback =
          typeof parsed.feedback === 'string' && parsed.feedback.trim()
            ? parsed.feedback.trim()
            : 'Bravo pour avoir terminé ce quiz !';

        return {
          feedback,
          notionsToReview: this.extractNotionsToReview(parsed),
        };
      } catch {
        return {
          feedback: cleanedContent,
          notionsToReview: [],
        };
      }
    } catch {
      throw new ServerError('No response from OpenAI');
    }
  }

  private extractNotionsToReview(parsed: Record<string, unknown>): string[] {
    const candidates = [
      parsed.notionsToReview,
      parsed.notionsToRevise,
      parsed.notions_to_review,
      parsed.notionsAReviser,
      parsed.notions_a_reviser,
    ];

    for (const candidate of candidates) {
      if (!Array.isArray(candidate)) {
        continue;
      }
      return candidate
        .map((item) => {
          if (typeof item === 'string') {
            return item;
          }
          if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') {
            return item.name;
          }
          return null;
        })
        .filter((item): item is string => Boolean(item?.trim()));
    }

    return [];
  }
}
