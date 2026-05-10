import { Module } from '@nestjs/common';
import { DeleteStudentSessionUseCase } from 'src/application/teaching/student-session/delete-student-session.use-case';
import { StudentSessionController } from './student-session.controller';
import { GetSessionStudentUseCase } from 'src/application/teaching/student-session/get-session-student.use-case';
import { GetStudentJoinedSessionsUseCase } from 'src/application/teaching/student-session/get-student-joined-sessions.use-case';
import { JoinSessionByCodeUseCase } from 'src/application/teaching/student-session/join-session-by-code.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/student/student-persistence.module';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/session/sessions-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/establishment/establishment-persistence.module';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { StudentSessionPersistenceModule } from 'src/infrastructure/supabase/teaching/student-session/student-session-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    StudentPersistenceModule,
    SessionsPersistenceModule,
    EstablishmentPersistenceModule,
    TeacherPersistenceModule,
    StudentSessionPersistenceModule,
  ],
  controllers: [StudentSessionController],
  providers: [
    GetStudentJoinedSessionsUseCase,
    JoinSessionByCodeUseCase,
    GetSessionStudentUseCase,
    DeleteStudentSessionUseCase,
  ],
})
export class StudentSessionModule {}
