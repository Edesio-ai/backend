import { Module } from '@nestjs/common';
import { SessionModule } from './session/session.module';
import { EstablishmentModule } from './establishment/establishment.module';
import { QuestionModule } from './questions/question.module';
import { CourseFileModule } from './course-file/course-file.module';
import { CourseQuestionModule } from './course-questions/course-question.module';
import { CourseModule } from './course/course.module';
import { StudentCourseStatsModule } from './student-course-stats/student-course-stats.module';
import { StudentModule } from './student/student.module';
import { StudentSessionModule } from './student-session/student-session.module';
import { TeacherModule } from './teacher/teacher.module';
import { SelfLearnerModule } from './self-learner/self-learner.module';
import { SelfLearnerCourseModule } from './self-learner-course/self-learner-course.module';

@Module({
  imports: [
    EstablishmentModule,
    TeacherModule,
    SessionModule,
    CourseModule,
    QuestionModule,
    CourseFileModule,
    StudentModule,
    CourseQuestionModule,
    StudentCourseStatsModule,
    StudentSessionModule,
    SelfLearnerModule,
    SelfLearnerCourseModule,
  ],
})
export class TeachingModule {}
