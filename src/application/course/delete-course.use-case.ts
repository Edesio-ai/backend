import { Inject } from '@nestjs/common';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interface/teacher.repository';
import {
  NotFoundError,
  UnauthorizedError,
} from 'src/domain/shared/global/errors/global.errors';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/domain/teaching/interface/questions.repository';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interface/student.repository';

export class DeleteCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
  ) {}

  async execute(courseId: string, user: AuthUser): Promise<void> {
    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundError();
    }

    const select = `
            id,
            sessions:sessions!inner (
                teacher_id
            )
        `;
    const courseWithSession =
      await this.courseRepository.getCourseWithSessionById(courseId, select);
    if (!courseWithSession) {
      console.error(`Course ${courseId} not found`);
      throw new NotFoundError(`Course not found`);
    }

    if (courseWithSession.session.teacherId !== teacher.id) {
      console.error(
        `Teacher ${teacher.id} is not allowed to delete course ${courseId}`,
      );
      throw new UnauthorizedError('You are not allowed to delete this course');
    }

    await this.questionsRepository.deleteCourseQuizQuestions(courseId);
    await this.courseRepository.deleteCoursesFilesByCourseIds([courseId]);
    await this.studentRepository.deleteStudentCourseStatsByCourseId(courseId);
    await this.questionsRepository.deleteCourseQuestionsByCourseId(courseId);
    await this.courseRepository.deleteCourseById(courseId);
  }
}
