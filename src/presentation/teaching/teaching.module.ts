import { Module } from '@nestjs/common';
import { TeacherModule } from './modules/teacher.module';
import { CourseModule } from './modules/course.module';
import { SessionModule } from './modules/session.module';
import { EstablishmentModule } from './modules/establishment.module';
import { QuestionModule } from './modules/question.module';

@Module({
  imports: [
    EstablishmentModule,
    TeacherModule,
    SessionModule,
    CourseModule,
    QuestionModule,
  ],
})
export class TeachingModule {}
