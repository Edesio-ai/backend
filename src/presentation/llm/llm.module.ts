import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GenerateCompletionFeedbackUseCase } from 'src/application/llm/generate-completion-feedback.use-case';
import { OpenaiModule } from 'src/infrastructure/llm/openai/openai.module';
import { GenerateQuestionUseCase } from 'src/application/llm/generate-question-use-case';
import { EvaluateAnswerUseCase } from 'src/application/llm/evaluate-answer.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/course/course-persistence.module';
import { PdfModule } from 'src/infrastructure/pdf/pdf.module';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/question/question-persistence.module';
import { CourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/course-file/course-file-persistence.repository';
import { SelfLearnerPersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner/self-learner-persistence.module';
import { SelfLearnerCoursePersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner-course/self-learner-course-persistence.module';
import { SelfLearnerCourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner-course-file/self-learner-course-file-persistence.module';
import { SelfLearnerQuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner-question/self-learner-question-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    TeacherPersistenceModule,
    SelfLearnerPersistenceModule,
    SelfLearnerCoursePersistenceModule,
    SelfLearnerCourseFilePersistenceModule,
    SelfLearnerQuestionPersistenceModule,
    OpenaiModule,
    CourseFilePersistenceModule,
    CoursePersistenceModule,
    PdfModule,
    QuestionPersistenceModule,
  ],
  controllers: [LlmController],
  providers: [
    GenerateCompletionFeedbackUseCase,
    GenerateQuestionUseCase,
    EvaluateAnswerUseCase,
  ],
})
export class LlmModule {}
