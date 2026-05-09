import { Module } from '@nestjs/common';
import { CourseController } from '../course/course.controller';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/course/course-persistence.module';
import { CreateCourseUseCase } from 'src/application/teaching/course/create-course.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetCourseValidatedQuestionsUseCase } from 'src/application/teaching/course/get-course-validated-questions.use-case';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/sessions-persistence.module';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/student-persistence.module';
import { DeleteCourseUseCase } from 'src/application/teaching/course/delete-course.use-case';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/question-persistence.module';
import { UpdateCourseUseCase } from 'src/application/teaching/course/update-course.use-case';
import { ValidateCourseQuestionsUseCase } from 'src/application/teaching/course/validate-course-questions.use-case';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/establishment-persistence.module';
import { GetCoursesSessionCountUseCase } from 'src/application/teaching/course/get-courses-session-count.use-case';
import { GetSessionCoursesUseCase } from 'src/application/teaching/course/get-session-courses.use-case';
import { CourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/course-file/course-file-supabase.repository';

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
  ],
})
export class CourseModule {}
