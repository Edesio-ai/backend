import { FileSupabaseRepository } from '../repositories/course-file-supabase.repository';
import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase.module';
import { FILE_REPOSITORY } from 'src/domain/teaching/interfaces/file.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: FILE_REPOSITORY,
      useClass: FileSupabaseRepository,
    },
  ],
  exports: [FILE_REPOSITORY],
})
export class FilePersistenceModule {}
