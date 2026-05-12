import { Inject, NotFoundException } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  COURSE_QUESTION_REPOSITORY,
  type ICourseQuestionRepository,
} from 'src/domain/teaching/course-question/contracts/i-course-question.repository';
import { AnswerCourseQuestionBodyDto } from 'src/presentation/teaching/course-questions/dtos/answer-course-question.dto';
import { CourseQuestion } from 'src/domain/teaching/course-question/types/course-question.type';
import {
  type ITeacherRepository,
  TEACHER_REPOSITORY,
} from 'src/domain/teaching/teacher/contracts/teacher.repository';
import {
  COURSE_REPOSITORY,
  type ICourseRepository,
} from 'src/domain/teaching/course/contracts/i-course.repository';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';

export class AnswerCourseQuestionUseCase {
  constructor(
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly courseQuestionRepository: ICourseQuestionRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(
    body: AnswerCourseQuestionBodyDto,
    user: AuthUser,
  ): Promise<CourseQuestion | null> {
    const { courseQuestionId } = body;

    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    const courseQuestion =
      await this.courseQuestionRepository.getCourseQuestionByCourseId(
        courseQuestionId,
      );

    if (!courseQuestion) {
      throw new NotFoundException('Course question not found');
    }

    const course = await this.courseRepository.getCourseById(
      courseQuestion.courseId,
    );
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const session = await this.sessionRepository.getSessionById(
      course.sessionId,
    );
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const courseQuestions =
      await this.courseQuestionRepository.getCourseQuestionsByCourseId(
        course.id,
      );
    if (courseQuestions.length === 0) {
      throw new NotFoundException('No course questions found');
    }

    const updatePayload = {
      answer: body.answer,
      answeredAt: new Date().toISOString(),
    };
    const updatedCourseQuestion =
      await this.courseQuestionRepository.updateCourseQuestion(
        body.courseQuestionId,
        updatePayload,
      );

    return updatedCourseQuestion;
  }
}
