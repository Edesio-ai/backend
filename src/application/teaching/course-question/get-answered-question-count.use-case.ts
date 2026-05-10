import { Inject } from '@nestjs/common';

import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  COURSE_QUESTION_REPOSITORY,
  type ICourseQuestionRepository,
} from 'src/domain/teaching/course-question/contracts/i-course-question.repository';

export class GetAnsweredQuestionCountUseCase {
  constructor(
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly courseQuestionRepository: ICourseQuestionRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
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
