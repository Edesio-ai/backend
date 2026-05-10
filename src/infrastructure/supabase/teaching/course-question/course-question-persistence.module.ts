import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase.module';
import { CourseQuestionSupabaseRepository } from './repositories/course-question-supabase';
import { COURSE_QUESTION_REPOSITORY } from 'src/domain/teaching/course-question/contracts/i-course-question.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: COURSE_QUESTION_REPOSITORY,
      useClass: CourseQuestionSupabaseRepository,
    },
  ],
  exports: [COURSE_QUESTION_REPOSITORY],
})
export class CourseQuestionPersistenceModule {}
