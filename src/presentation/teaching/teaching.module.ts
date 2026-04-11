import { Module } from '@nestjs/common';
import { TeacherModule } from './modules/teacher.module';
import { CourseModule } from './modules/course.module';
import { SessionModule } from './modules/session.module';
import { EstablishmentModule } from './modules/establishment.module';

@Module({
  imports: [EstablishmentModule, TeacherModule, SessionModule, CourseModule],
})
export class TeachingModule {}
