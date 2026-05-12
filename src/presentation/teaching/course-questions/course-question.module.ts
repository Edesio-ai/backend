import { Module } from '@nestjs/common';
import { GetAnsweredQuestionCountUseCase } from 'src/application/teaching/course-question/get-answered-question-count.use-case';
import { GetPendingQuestionCountUseCase } from 'src/application/teaching/course-question/get-pending-question-count.use-case';
import { CourseQuestionsController } from './course-questions.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/course/course-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/student/student-persistence.module';
import { GetStudentCourseQuestionsUseCase } from 'src/application/teaching/course-question/get-student-course-questions.use-case';
import { CourseQuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/course-question/course-question-persistence.module';
import { StudentSessionPersistenceModule } from 'src/infrastructure/supabase/teaching/student-session/student-session-persistence.module';
import { SupabaseModule } from 'src/infrastructure/supabase/supabase.module';
import { SendCourseQuestionUseCase } from 'src/application/teaching/course-question/send-course-question.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/session/sessions-persistence.module';
import { AnswerCourseQuestionUseCase } from 'src/application/teaching/course-question/answer-course-question.use-case';

@Module({
  imports: [
    AuthPersistenceModule,
    CoursePersistenceModule,
    StudentPersistenceModule,
    CourseQuestionPersistenceModule,
    StudentSessionPersistenceModule,
    SupabaseModule,
    TeacherPersistenceModule,
    SessionsPersistenceModule,
  ],
  controllers: [CourseQuestionsController],
  providers: [
    GetPendingQuestionCountUseCase,
    GetAnsweredQuestionCountUseCase,
    GetStudentCourseQuestionsUseCase,
    SendCourseQuestionUseCase,
    AnswerCourseQuestionUseCase,
  ],
})
export class CourseQuestionModule {}
