import { Inject } from "@nestjs/common";
import { AuthUser } from "src/domain/auth/types/auth.type";
import { COURSE_REPOSITORY, type CourseRepository } from "src/domain/teaching/interface/course.repository";
import { QUESTIONS_REPOSITORY, type QuestionsRepository } from "src/domain/teaching/interface/questions.repository";
import { NotFoundError } from "src/domain/shared/global/errors/global.errors";
import { TEACHER_REPOSITORY, type TeacherRepository } from "src/domain/teaching/interface/teacher.repository";

interface UpdateQuestionBody {
  questionText?: string;
  correctAnswer?: string[];
  explanation?: string;
  type?: 'qcm' | 'ouverte';
  proposals?: string[];
}

export class UpdateQuestionByIdUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly coursesRepository: CourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
  ) {}

  async execute(questionId: string,body: UpdateQuestionBody, user: AuthUser): Promise<boolean> {
    const question = await this.questionsRepository.getQuestionById(questionId);
    if(!question) {
      throw new NotFoundError('Question not found');
    }

    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    return true;
  }
}