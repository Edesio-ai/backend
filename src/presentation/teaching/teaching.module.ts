import { Module } from '@nestjs/common';
import { TeacherModule } from './modules/teacher.module';
import { SessionModule } from './modules/session.module';
import { EstablishmentModule } from './modules/establishment.module';
import { QuestionModule } from './questions/question.module';
import { FileModule } from './file/file.module';
import { StudentModule } from './modules/student.module';
import { CourseQuestionModule } from './course-questions/course-question.module';
import { CourseModule } from './course/course.module';
import { StudentCourseStatsModule } from './student-course-stats/student-course-stats.module';

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
    StudentCourseStatsModule,
  ],
})
export class TeachingModule {}
