import { Inject } from '@nestjs/common';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/domain/teaching/interfaces/questions.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interfaces/student.repository';
import { NotFoundError } from 'src/domain/shared/global/errors/global.errors';

export class GetAnsweredQuestionCountUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
  ) {}

  async execute(user: AuthUser): Promise<number> {
    const student = await this.studentRepository.getStudentByUserId(user.id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    const answeredQuestionsCount =
      await this.questionsRepository.getAnsweredQuestionCount(student.id);

    return answeredQuestionsCount;
  }
}
