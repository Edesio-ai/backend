import { Module } from '@nestjs/common';
import { TeacherModule } from './modules/teacher.module';
import { CourseModule } from './modules/course.module';
import { SessionModule } from './modules/session.module';
import { EstablishmentModule } from './modules/establishment.module';
import { QuestionModule } from './questions/question.module';
import { FileModule } from './file/file.module';
import { StudentModule } from './modules/student.module';
import { CourseQuestionModule } from './course-questions/course-question.module';

@Module({
  imports: [
    EstablishmentModule,
    TeacherModule,
    SessionModule,
    CourseModule,
    QuestionModule,
    FileModule,
    StudentModule,
    CourseQuestionModule,
  ],
})
export class TeachingModule {}
