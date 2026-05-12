import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetTeacherSessionsUseCase } from 'src/application/teaching/session/get-teacher-sessions.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { CreateSessionUseCase } from 'src/application/teaching/session/create-session.use-case';
import { UpdateSessionNameUseCase } from 'src/application/teaching/session/update-session-name.use-case';
import { GetSessionByCodeUseCase } from 'src/application/teaching/session/get-session-by-code.use-case';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/course/course-persistence.module';
import { DeleteSessionUseCase } from 'src/application/teaching/session/delete-session.use-case';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/question/question-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/student/student-persistence.module';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/session/sessions-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/establishment/establishment-persistence.module';
import { GetSessionDetailsUseCase } from 'src/application/teaching/session/get-session-details.use-case';
import { CourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/course-file/course-file-persistence.repository';
import { StudentSessionPersistenceModule } from 'src/infrastructure/supabase/teaching/student-session/student-session-persistence.module';
import { StudentCourseStatsPersistenceModule } from 'src/infrastructure/supabase/teaching/student-course-stats/student-course-states-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    TeacherPersistenceModule,
    SessionsPersistenceModule,
    CoursePersistenceModule,
    QuestionPersistenceModule,
    StudentPersistenceModule,
    EstablishmentPersistenceModule,
    CourseFilePersistenceModule,
    StudentSessionPersistenceModule,
    StudentCourseStatsPersistenceModule,
  ],
  controllers: [SessionController],
  providers: [
    GetTeacherSessionsUseCase,
    CreateSessionUseCase,
    UpdateSessionNameUseCase,
    GetSessionByCodeUseCase,
    DeleteSessionUseCase,
    GetSessionDetailsUseCase,
  ],
})
export class SessionModule {}
