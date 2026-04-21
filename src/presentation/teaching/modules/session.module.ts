import { Module } from '@nestjs/common';
import { SessionController } from '../controllers/session.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetTeacherSessionsUseCase } from 'src/application/teacher/get-teacher-sessions.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { CreateSessionUseCase } from 'src/application/session/create-session.use-case';
import { UpdateSessionNameUseCase } from 'src/application/session/update-session-name.use-case';
import { GetSessionByCodeUseCase } from 'src/application/session/get-session-by-code.use-case';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/course-persistence.module';
import { DeleteSessionUseCase } from 'src/application/session/delete-session.use-case';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/question-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/student-persistence.module';
import { GetCoursesSessionCountUseCase } from 'src/application/session/get-courses-session-count.use-case';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/sessions-persistence.module';
import { GetSessionCoursesUseCase } from 'src/application/session/get-session-courses.use-case';

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
    GetSessionCoursesUseCase,
  ],
})
export class SessionModule {}
