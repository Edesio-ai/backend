import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
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
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/sessions-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/establishment-persistence.module';
import { GetSessionDetailsUseCase } from 'src/application/session/get-session-details.use-case';
import { FilePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/file-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    TeacherPersistenceModule,
    SessionsPersistenceModule,
    CoursePersistenceModule,
    QuestionPersistenceModule,
    StudentPersistenceModule,
    EstablishmentPersistenceModule,
    FilePersistenceModule,
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
