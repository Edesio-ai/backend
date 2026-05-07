import { Module } from '@nestjs/common';
import { CourseController } from '../course/course.controller';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/course-persistence.module';
import { CreateCourseUseCase } from 'src/application/course/create-course.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetCourseValidatedQuestionsUseCase } from 'src/application/course/get-course-validated-questions.use-case';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/sessions-persistence.module';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/student-persistence.module';
import { DeleteCourseUseCase } from 'src/application/course/delete-course.use-case';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/question-persistence.module';
import { UpdateCourseUseCase } from 'src/application/course/update-course.use-case';
import { ValidateCourseQuestionsUseCase } from 'src/application/course/validate-course-questions.use-case';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/establishment-persistence.module';
import { FilePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/file-persistence.module';

@Module({
  imports: [
    CoursePersistenceModule,
    AuthPersistenceModule,
    SessionsPersistenceModule,
    TeacherPersistenceModule,
    StudentPersistenceModule,
    QuestionPersistenceModule,
    EstablishmentPersistenceModule,
    FilePersistenceModule,
  ],
  controllers: [CourseController],
  providers: [
    CreateCourseUseCase,
    GetCourseValidatedQuestionsUseCase,
    DeleteCourseUseCase,
    UpdateCourseUseCase,
    ValidateCourseQuestionsUseCase,
  ],
})
export class CourseModule {}
