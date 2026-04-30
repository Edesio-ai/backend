import { Module } from '@nestjs/common';
import { TeacherModule } from './modules/teacher.module';
import { CourseModule } from './modules/course.module';
import { SessionModule } from './modules/session.module';
import { EstablishmentModule } from './modules/establishment.module';
import { QuestionModule } from './modules/question.module';
import { FileModule } from './modules/file.module';
import { StudentModule } from './modules/student.module';

@Module({
  imports: [
    EstablishmentModule,
    TeacherModule,
    SessionModule,
    CourseModule,
    QuestionModule,
    FileModule,
    StudentModule,
  ],
})
export class TeachingModule {}
