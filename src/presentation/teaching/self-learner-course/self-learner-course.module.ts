import { Module } from '@nestjs/common';
import { SelfLearnerCourseController } from './self-learner-course.controller';
import { GetSelfLearnerCoursesUseCase } from 'src/application/teaching/self-learner-course/get-self-learner-courses.use-case';
import { SelfLearnerCoursePersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner-course/self-learner-course-persistence.module';
import { SelfLearnerPersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner/self-learner-persistence.module';
import { GetSelfLearnerCoursesCountUseCase } from 'src/application/teaching/self-learner-course/get-self-learner-courses-count.use-case';
import { CreateSelfLearnerCourseUseCase } from 'src/application/teaching/self-learner-course/create-self-learner-course.use-case';
import { UpdateSelfLearnerCourseUseCase } from 'src/application/teaching/self-learner-course/update-self-learner-course.use-case';

@Module({
  imports: [SelfLearnerCoursePersistenceModule, SelfLearnerPersistenceModule],
  controllers: [SelfLearnerCourseController],
  providers: [
    GetSelfLearnerCoursesUseCase,
    GetSelfLearnerCoursesCountUseCase,
    CreateSelfLearnerCourseUseCase,
    UpdateSelfLearnerCourseUseCase,
  ],
})
export class SelfLearnerCourseModule {}
