import { Module } from '@nestjs/common';
import { TeacherModule } from './modules/teacher.module';
import { SessionModule } from './session/session.module';
import { EstablishmentModule } from './establishment/establishment.module';
import { QuestionModule } from './questions/question.module';
import { FileModule } from './file/file.module';
import { CourseQuestionModule } from './course-questions/course-question.module';
import { CourseModule } from './course/course.module';
import { StudentCourseStatsModule } from './student-course-stats/student-course-stats.module';
import { StudentModule } from './student/student.module';
import { StudentSessionModule } from './student-session/student-session.module';

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
    StudentSessionModule,
  ],
})
export class TeachingModule {}
