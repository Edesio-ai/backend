import { Module } from '@nestjs/common';
import { COURSE_QUESTION_REPOSITORY } from 'src/domain/teaching/interfaces/i-course-question.repository';
import { CourseQuestionSupabaseRepository } from './repositories/course-question-supabase';
import { SupabaseModule } from '../../supabase.module';

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
