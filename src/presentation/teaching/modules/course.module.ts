import { Module } from '@nestjs/common';
import { CourseController } from '../controllers/course.controller';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/course-persistence.module';
import { CreateCourseUseCase } from 'src/application/course/create-course.use-case';
import { UploadCourseFileUseCase } from 'src/application/course/upload-course-file.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetCourseValidatedQuestionsUseCase } from 'src/application/course/get-course-validated-questions';
import { GetCourseFilesUseCase } from 'src/application/course/get-course-files.use-case';
import { GetCourseRankingUseCase } from 'src/application/course/get-course-ranking.use-case';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/sessions-persistence.module';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/student-persistence.module';

@Module({
  imports: [
    CoursePersistenceModule,
    AuthPersistenceModule,
    SessionsPersistenceModule,
    TeacherPersistenceModule,
    StudentPersistenceModule,
  ],
  controllers: [CourseController],
  providers: [
    CreateCourseUseCase,
    UploadCourseFileUseCase,
    GetCourseValidatedQuestionsUseCase,
    GetCourseFilesUseCase,
    GetCourseRankingUseCase,
  ],
})
export class CourseModule {}
