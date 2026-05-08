import { Module } from '@nestjs/common';
import { DeleteStudentSessionUseCase } from 'src/application/student/delete-student-session.use-case';
import { StudentSessionController } from './student-session.controller';
import { GetSessionStudentUseCase } from 'src/application/student/get-session-student.use-case';
import { GetStudentJoinedSessionsUseCase } from 'src/application/student/get-student-joined-sessions.use-case';
import { JoinSessionByCodeUseCase } from 'src/application/student/join-session-by-code.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/student-persistence.module';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/sessions-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/establishment-persistence.module';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    StudentPersistenceModule,
    SessionsPersistenceModule,
    EstablishmentPersistenceModule,
    TeacherPersistenceModule,
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
