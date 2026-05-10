import { Module } from '@nestjs/common';
import { COURSE_FILE_REPOSITORY } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import { CourseFileRepository } from './repositories/course-file-supabase.repository';
import { SupabaseModule } from '../../supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: COURSE_FILE_REPOSITORY,
      useClass: CourseFileRepository,
    },
  ],
  exports: [COURSE_FILE_REPOSITORY],
})
export class CourseFilePersistenceModule {}
