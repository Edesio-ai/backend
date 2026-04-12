import { Module } from '@nestjs/common';
import { SessionController } from '../controllers/session.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetTeacherSessionsUseCase } from 'src/application/teacher/get-teacher-sessions.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teacher/teacher-persistence.module';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/session/sessions-persistence.module';
import { CreateSessionUseCase } from 'src/application/session/create-session.use-case';
import { UpdateSessionNameUseCase } from 'src/application/session/update-session-name.use-case';
import { GetSessionByCodeUseCase } from 'src/application/session/get-session-by-code.use-case';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/course/repositories/course-persistence.module';
import { DeleteSessionUseCase } from 'src/application/session/delete-session.use-case';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/question/question-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/student/student-persistence.module';
import { GetCoursesSessionCountUseCase } from 'src/application/session/get-courses-session-count.use-case';

@Module({
  imports: [
    AuthPersistenceModule,
    TeacherPersistenceModule,
    SessionsPersistenceModule,
    CoursePersistenceModule,
    QuestionPersistenceModule,
    StudentPersistenceModule,
  ],
  controllers: [SessionController],
  providers: [
    GetTeacherSessionsUseCase,
    CreateSessionUseCase,
    UpdateSessionNameUseCase,
    GetSessionByCodeUseCase,
    DeleteSessionUseCase,
    GetCoursesSessionCountUseCase,
  ],
})
export class SessionModule {}
