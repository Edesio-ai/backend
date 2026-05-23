import { Module } from '@nestjs/common';
import { SelfLearnerCourseController } from './self-learner-course.controller';
import { GetSelfLearnerCoursesUseCase } from 'src/application/teaching/self-learner-course/get-self-learner-courses.use-case';
import { SelfLearnerCoursePersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner-course/self-learner-course-persistence.module';
import { SelfLearnerPersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner/self-learner-persistence.module';
import { GetSelfLearnerCoursesCountUseCase } from 'src/application/teaching/self-learner-course/get-self-learner-courses-count.use-case';
import { CreateSelfLearnerCourseUseCase } from 'src/application/teaching/self-learner-course/create-self-learner-course.use-case';
import { UpdateSelfLearnerCourseUseCase } from 'src/application/teaching/self-learner-course/update-self-learner-course.use-case';
import { DeleteSelfLearnerCourseUseCase } from 'src/application/teaching/self-learner-course/delete-self-learner-course.use-case';
import { SelfLearnerCourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner-course-file/self-learner-course-file-persistence.module';
import { CourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/course-file/course-file-persistence.repository';
import { SelfLearnerQuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner-question/self-learner-question-persistence.module';

@Module({
  imports: [
    SelfLearnerCoursePersistenceModule,
    SelfLearnerPersistenceModule,
    SelfLearnerCourseFilePersistenceModule,
    CourseFilePersistenceModule,
    SelfLearnerQuestionPersistenceModule,
  ],
  controllers: [SelfLearnerCourseController],
  providers: [
    GetSelfLearnerCoursesUseCase,
    GetSelfLearnerCoursesCountUseCase,
    CreateSelfLearnerCourseUseCase,
    UpdateSelfLearnerCourseUseCase,
    DeleteSelfLearnerCourseUseCase,
  ],
})
export class SelfLearnerCourseModule {}
