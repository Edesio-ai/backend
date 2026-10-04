import { Module } from '@nestjs/common';
import { CourseController } from '../course/course.controller';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/course/course-persistence.module';
import { CreateCourseUseCase } from 'src/application/teaching/course/create-course.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetCourseValidatedQuestionsUseCase } from 'src/application/teaching/course/get-course-validated-questions.use-case';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/session/sessions-persistence.module';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/student/student-persistence.module';
import { DeleteCourseUseCase } from 'src/application/teaching/course/delete-course.use-case';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/question/question-persistence.module';
import { UpdateCourseUseCase } from 'src/application/teaching/course/update-course.use-case';
import { ValidateCourseQuestionsUseCase } from 'src/application/teaching/course/validate-course-questions.use-case';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/establishment/establishment-persistence.module';
import { GetCoursesSessionCountUseCase } from 'src/application/teaching/course/get-courses-session-count.use-case';
import { GetSessionCoursesUseCase } from 'src/application/teaching/course/get-session-courses.use-case';
import { GetCourseDetailsUseCase } from 'src/application/teaching/course/get-course-details.use-case';
import { CourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/course-file/course-file-persistence.repository';
import { CourseQuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/course-question/course-question-persistence.module';
import { StudentCourseStatsPersistenceModule } from 'src/infrastructure/supabase/teaching/student-course-stats/student-course-states-persistence.module';
import { StudentSessionPersistenceModule } from 'src/infrastructure/supabase/teaching/student-session/student-session-persistence.module';

@Module({
  imports: [
    CoursePersistenceModule,
    AuthPersistenceModule,
    SessionsPersistenceModule,
    TeacherPersistenceModule,
    StudentPersistenceModule,
    QuestionPersistenceModule,
    EstablishmentPersistenceModule,
    CourseFilePersistenceModule,
    CourseQuestionPersistenceModule,
    StudentCourseStatsPersistenceModule,
    StudentSessionPersistenceModule,
  ],
  controllers: [CourseController],
  providers: [
    CreateCourseUseCase,
    GetCourseValidatedQuestionsUseCase,
    DeleteCourseUseCase,
    UpdateCourseUseCase,
    ValidateCourseQuestionsUseCase,
    GetCoursesSessionCountUseCase,
    GetSessionCoursesUseCase,
    GetCourseDetailsUseCase,
  ],
})
export class CourseModule {}
