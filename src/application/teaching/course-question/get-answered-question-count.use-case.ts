import { Inject } from '@nestjs/common';

import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interfaces/student.repository';
import { NotFoundError } from 'src/domain/shared/global/errors/global.errors';
import {
  COURSE_QUESTION_REPOSITORY,
  type ICourseQuestionRepository,
} from 'src/domain/teaching/interfaces/i-course-question.repository';

export class GetAnsweredQuestionCountUseCase {
  constructor(
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly courseQuestionRepository: ICourseQuestionRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
  ) {}

  async execute(user: AuthUser): Promise<number> {
    const student = await this.studentRepository.getStudentByUserId(user.id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    const answeredQuestionsCount =
      await this.courseQuestionRepository.getAnsweredQuestionCount(student.id);

    return answeredQuestionsCount;
  }
}
