import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  COURSE_QUESTION_REPOSITORY,
  type ICourseQuestionRepository,
} from 'src/domain/teaching/course-question/contracts/i-course-question.repository';
import { CourseQuestion, CourseQuestionToInsert } from 'src/domain/teaching/course-question/types/course-question.type';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { isCourseVisibleToStudents } from 'src/domain/teaching/course/course.utils';
import {
  STUDENT_SESSION_REPOSITORY,
  type IStudentSessionRepository,
} from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import {
  type IStudentRepository,
  STUDENT_REPOSITORY,
} from 'src/domain/teaching/student/contracts/I-student.repository';

export type SendCourseQuestionBody = {
  questionText: string;
  courseId: string;
};
export class SendCourseQuestionUseCase {
  constructor(
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly courseQuestionRepository: ICourseQuestionRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(body: SendCourseQuestionBody, user: AuthUser): Promise<CourseQuestion | null> {
    const student = await this.studentRepository.getStudentByUserId(user.id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const course = await this.courseRepository.getCourseById(body.courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!isCourseVisibleToStudents(course)) {
      throw new ForbiddenException('You are not authorized to access this course');
    }

    const studentSession = await this.studentSessionRepository.getStudentSession(course.sessionId, student.id);
    if (!studentSession) {
      throw new ForbiddenException('You are not enrolled in this session');
    }

    const newCourseQuestion: CourseQuestionToInsert = {
      ...body,
      studentId: student.id,
    };

    const courseQuestion = await this.courseQuestionRepository.createCourseQuestion(newCourseQuestion);
    return courseQuestion;
  }
}
