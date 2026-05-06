import { Module } from '@nestjs/common';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/student-persistence.module';
import { StudentController } from '../controllers/student.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetStudentByUserIdUseCase } from 'src/application/student/get-student-by-user-id.use-case';
import { CreateStudentUseCase } from 'src/application/student/create-student.use-case';
import { GetStudentJoinedSessionsUseCase } from 'src/application/student/get-student-joined-sessions.use-case';
import { JoinSessionByCodeUseCase } from 'src/application/student/join-session-by-code.use-case';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/sessions-persistence.module';
import { GetSessionStudentUseCase } from 'src/application/student/get-session-student.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/establishment-persistence.module';
import { GetStudentBatchUseCase } from 'src/application/student/get-student-batch.use-case';
import { UploadStudentPhotoUseCase } from 'src/application/student/upload-student-photo.use-case';
import { DeleteStudentSessionUseCase } from 'src/application/student/delete-student-session.use-case';
import { UpdateOrCreateStudentCourseStatsUseCase } from 'src/application/student/update-or-create-student-course-stats.use-case';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/course-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    StudentPersistenceModule,
    SessionsPersistenceModule,
    TeacherPersistenceModule,
    EstablishmentPersistenceModule,
    CoursePersistenceModule,
  ],
  controllers: [StudentController],
  providers: [
    GetSessionStudentUseCase,
    GetStudentByUserIdUseCase,
    CreateStudentUseCase,
    GetStudentJoinedSessionsUseCase,
    JoinSessionByCodeUseCase,
    GetStudentBatchUseCase,
    UploadStudentPhotoUseCase,
    DeleteStudentSessionUseCase,
    UpdateOrCreateStudentCourseStatsUseCase,
  ],
})
export class StudentModule {}
