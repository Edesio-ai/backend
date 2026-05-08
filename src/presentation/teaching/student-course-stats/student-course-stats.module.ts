import { StudentCourseStatsController } from './student-course-stats.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { Module } from '@nestjs/common';
import { GetCourseRankingUseCase } from 'src/application/teaching/student-course-stats/get-course-ranking.use-case';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/course-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/student-persistence.module';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/sessions-persistence.module';
import { UpdateOrCreateStudentCourseStatsUseCase } from 'src/application/teaching/student-course-stats/update-or-create-student-course-stats.use-case';

@Module({
  imports: [
    AuthPersistenceModule,
    CoursePersistenceModule,
    StudentPersistenceModule,
    TeacherPersistenceModule,
    SessionsPersistenceModule,
  ],
  controllers: [StudentCourseStatsController],
  providers: [GetCourseRankingUseCase, UpdateOrCreateStudentCourseStatsUseCase],
})
export class StudentCourseStatsModule {}
