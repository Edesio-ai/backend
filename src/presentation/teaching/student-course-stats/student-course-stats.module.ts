import { Module } from '@nestjs/common';
import { StudentCourseStatsController } from './student-course-stats.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetCourseRankingUseCase } from 'src/application/teaching/student-course-stats/get-course-ranking.use-case';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/course/course-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/student/student-persistence.module';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/session/sessions-persistence.module';
import { UpdateOrCreateStudentCourseStatsUseCase } from 'src/application/teaching/student-course-stats/update-or-create-student-course-stats.use-case';
import { StudentCourseStatsPersistenceModule } from 'src/infrastructure/supabase/teaching/student-course-stats/student-course-states-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    CoursePersistenceModule,
    StudentPersistenceModule,
    TeacherPersistenceModule,
    SessionsPersistenceModule,
    StudentCourseStatsPersistenceModule,
  ],
  controllers: [StudentCourseStatsController],
  providers: [GetCourseRankingUseCase, UpdateOrCreateStudentCourseStatsUseCase],
})
export class StudentCourseStatsModule {}
