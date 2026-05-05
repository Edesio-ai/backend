import { OpenAI } from 'openai';
import { OPENAI_CLIENT } from './openai.constants';
import { Inject, Injectable } from '@nestjs/common';
import {
  GeneratedQuestion,
  QuestionGenerationConfig,
} from 'src/domain/teaching/types/question.type';
import type { OpenaiRepository as OpenaiRepositoryContract } from 'src/domain/shared/llm/openai/contracts/opena-ai.repository';
import {
  getGenerateQuestionSystemPrompt,
  getGenerateQuestionUserPrompt,
} from './prompts/generate-question.prompt';
import { OpenAiServerError } from 'src/domain/shared/llm/errors/open-ai.error';
import {
  getEvaluateAnswerSystemPrompt,
  getEvaluateAnswerUserPrompt,
} from './prompts/evaluate-answer.prompt';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';
import { EvaluateAnswerBody } from 'src/application/question/evaluate-answer.use-case';
import { EvaluateAnswerResponse } from 'src/domain/shared/llm/types/openai.type';

@Injectable()
export class OpenaiRepository implements OpenaiRepositoryContract {
  constructor(
    @Inject(OPENAI_CLIENT)
    private readonly openai: OpenAI,
  ) {}

  public async generateQuestions(
    courseContent: string,
    config: QuestionGenerationConfig,
    existingQuestions?: string[],
  ): Promise<GeneratedQuestion[]> {
    const maxChars = 15000;
    const truncatedContent =
      courseContent.length > maxChars
        ? courseContent.substring(0, maxChars) +
          '\n\n[Contenu tronqué pour respecter la limite]'
        : courseContent;

    const existingQuestionsContext =
      existingQuestions && existingQuestions.length > 0
        ? `\n\nQUESTIONS DÉJÀ EXISTANTES (NE PAS CRÉER DE DOUBLONS NI DE QUESTIONS SIMILAIRES) :\n${existingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n`
        : '';

    const systemPrompt = getGenerateQuestionSystemPrompt(config);
    const userPrompt = getGenerateQuestionUserPrompt(
      config,
      truncatedContent,
      existingQuestionsContext,
    );

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new OpenAiServerError('No response from OpenAI');
    }

    return JSON.parse(content).questions;
  }

  public async evaluateAnswer(
    body: EvaluateAnswerBody,
  ): Promise<EvaluateAnswerResponse> {
    const systemPrompt = getEvaluateAnswerSystemPrompt();
    const userPrompt = getEvaluateAnswerUserPrompt(body);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new ServerError('No response from OpenAI');
    }

    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const evaluation = JSON.parse(cleanedContent);

    return {
      score: evaluation.score,
      feedback: evaluation.feedback,
      concepts: evaluation.concepts || [],
      missingElements: evaluation.missingElements || [],
      suggestedAction: evaluation.suggestedAction || null,
      actionPrompt: evaluation.actionPrompt || null,
      correctAnswer: body.correctAnswer,
    };
  }
}
