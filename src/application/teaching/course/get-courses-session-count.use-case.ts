import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { isCourseVisibleToStudents } from 'src/domain/teaching/course/course.utils';

export class GetCoursesSessionCountUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(sessionId: string, user: AuthUser): Promise<number> {
    if (user.metadata.role === 'student') {
      const courses = await this.courseRepository.getSessionCoursesBySessionId(sessionId);
      return courses.filter(isCourseVisibleToStudents).length;
    }

    return await this.courseRepository.getSessionCoursesCount(sessionId);
  }
}
