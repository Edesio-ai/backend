import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { ProfileController } from './profile.controller';
import { Module } from '@nestjs/common';
import { UpdateProfileUseCase } from 'src/application/profile/update-profile.use-case';
import { UploadProfilePhotoUseCase } from 'src/application/profile/upload-profile-photo.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/establishment/establishment-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/student/student-persistence.module';
import { ProfilePersistenceModule } from 'src/infrastructure/supabase/profile/profile-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    TeacherPersistenceModule,
    EstablishmentPersistenceModule,
    StudentPersistenceModule,
    ProfilePersistenceModule,
  ],
  controllers: [ProfileController],
  providers: [UpdateProfileUseCase, UploadProfilePhotoUseCase],
})
export class ProfileModule {}
