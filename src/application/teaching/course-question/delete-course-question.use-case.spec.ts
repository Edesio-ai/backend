import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeleteCourseQuestionUseCase } from 'src/application/teaching/course-question/delete-course-question.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import type { ICourseQuestionRepository } from 'src/domain/teaching/course-question/contracts/i-course-question.repository';
import { CourseQuestion } from 'src/domain/teaching/course-question/types/course-question.type';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { CourseWithSession } from 'src/domain/teaching/course/types/course.type';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { Teacher } from 'src/domain/teaching/teacher/types/teacher.type';
import { createMockCourseQuestionRepository } from 'src/testing/mock-course-question-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

const DELETE_COURSE_QUESTION_SELECT = `
        id,
        sessions:sessions!inner (
            teacher_id
        )
        `;

describe('DeleteCourseQuestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delete course question when teacher owns the session', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseQuestionFound();
    fixtures.whenCourseWithSessionReturned();
    fixtures.whenDeleteByIdSucceeds();

    await fixtures.whenExecute();

    expect(fixtures.teacherRepository.getTeacherByUserId).toHaveBeenCalledWith(
      fixtures.teacherUser.id,
    );
    expect(
      fixtures.courseQuestionRepository.getCourseQuestionByCourseId,
    ).toHaveBeenCalledWith(fixtures.courseQuestionId);
    expect(
      fixtures.courseRepository.getCourseWithSessionById,
    ).toHaveBeenCalledWith(fixtures.courseId, DELETE_COURSE_QUESTION_SELECT);
    expect(
      fixtures.courseQuestionRepository.deleteCourseQuestionById,
    ).toHaveBeenCalledWith(fixtures.courseQuestionId);
  });

  it('should throw NotFoundException when teacher is missing', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(
      fixtures.courseQuestionRepository.getCourseQuestionByCourseId,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when course question is missing', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseQuestionNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(
      fixtures.courseRepository.getCourseWithSessionById,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when course with session is missing', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseQuestionFound();
    fixtures.whenCourseWithSessionMissing();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(
      fixtures.courseQuestionRepository.deleteCourseQuestionById,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when teacher does not own the session', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseQuestionFound();
    fixtures.whenCourseWithSessionWrongTeacher();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(
      fixtures.courseQuestionRepository.deleteCourseQuestionById,
    ).not.toHaveBeenCalled();
  });

  it('should propagate errors from deleteCourseQuestionById', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseQuestionFound();
    fixtures.whenCourseWithSessionReturned();
    fixtures.whenDeleteByIdFails();

    await expect(fixtures.whenExecute()).rejects.toBe(
      fixtures.deleteCourseQuestionError,
    );
  });
});

class Fixtures {
  public readonly courseQuestionId = '550e8400-e29b-41d4-a716-446655440011';
  public readonly courseId = '550e8400-e29b-41d4-a716-446655440022';

  public readonly teacherUser: AuthUser = {
    id: 'user-teacher-2',
    email: 't2@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'teacher' },
  };

  public readonly teacher: Teacher = {
    id: 'teacher-2',
    name: 'Prof 2',
    email: this.teacherUser.email,
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null,
    availableChatbots: 0,
    supabaseUserId: this.teacherUser.id,
  };

  public readonly courseQuestion: CourseQuestion = {
    id: this.courseQuestionId,
    courseId: this.courseId,
    studentId: 'student-1',
    questionText: 'Question ?',
    answer: '',
    createdAt: '2026-01-02T00:00:00.000Z',
    answeredAt: '',
  };

  public readonly courseWithSession: CourseWithSession = {
    id: this.courseId,
    session: { teacherId: this.teacher.id },
    teachers: { id: this.teacher.id },
  };

  public readonly deleteCourseQuestionError = new Error(
    'delete_course_question failed',
  );

  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly courseQuestionRepository: jest.Mocked<ICourseQuestionRepository>;
  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly useCase: DeleteCourseQuestionUseCase;

  constructor() {
    this.courseQuestionRepository = createMockCourseQuestionRepository();
    this.teacherRepository = createMockTeacherRepository();
    this.courseRepository = createMockCourseRepository();

    this.useCase = new DeleteCourseQuestionUseCase(
      this.courseQuestionRepository,
      this.teacherRepository,
      this.courseRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.courseQuestionId, this.teacherUser);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenCourseQuestionFound() {
    this.courseQuestionRepository.getCourseQuestionByCourseId.mockResolvedValue(
      this.courseQuestion,
    );
  }

  whenCourseQuestionNotFound() {
    this.courseQuestionRepository.getCourseQuestionByCourseId.mockResolvedValue(
      null,
    );
  }

  whenCourseWithSessionReturned() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue(
      this.courseWithSession,
    );
  }

  whenCourseWithSessionMissing() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue(
      null as unknown as CourseWithSession,
    );
  }

  whenCourseWithSessionWrongTeacher() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.courseId,
      session: { teacherId: 'other-teacher-id' },
      teachers: { id: 'other-teacher-id' },
    });
  }

  whenDeleteByIdSucceeds() {
    this.courseQuestionRepository.deleteCourseQuestionById.mockResolvedValue();
  }

  whenDeleteByIdFails() {
    this.courseQuestionRepository.deleteCourseQuestionById.mockRejectedValue(
      this.deleteCourseQuestionError,
    );
  }
}
