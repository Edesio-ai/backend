import { Inject } from '@nestjs/common';
import {
  ESTABLISHMENT_REPOSITORY,
  type EstablishmentRepository,
} from 'src/domain/teaching/interfaces/establishment.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/global/errors/global.errors';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interfaces/course.repository';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/domain/teaching/interfaces/questions.repository';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interfaces/student.repository';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/interfaces/i-course-file.repository';
import { StudentCourseStatsWithStudent } from 'src/domain/teaching/types/student.type';
import { SessionDetails } from 'src/domain/teaching/types/course.type';
import {
  type IStudentCourseStatsRepository,
  STUDENT_COURSE_STATS_REPOSITORY,
} from 'src/domain/teaching/interfaces/i-student-course-stats.repository';

export class GetSessionDetailsUseCase {
  constructor(
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: EstablishmentRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly coursesRepository: CourseRepository,
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentsRepository: StudentRepository,
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
    @Inject(STUDENT_COURSE_STATS_REPOSITORY)
    private readonly studentCourseStatsRepository: IStudentCourseStatsRepository,
  ) {}

  async execute(courseId: string, user: AuthUser): Promise<SessionDetails> {
    const establishment =
      await this.establishmentRepository.getEstablishmentByUserId(user.id);
    if (!establishment) {
      throw new NotFoundError('Establishment not found');
    }

    const select = `
          *,
          sessions!inner (
            id,
            name,
            teacher_id,
            teachers!inner (
              id,
              establishment_id
            )
          )
        `;
    const courseWithSession =
      await this.coursesRepository.getCourseWithSessionById(courseId, select);
    if (!courseWithSession) {
      throw new NotFoundError('Course not found');
    }

    if (courseWithSession.teachers.establishmentId !== establishment.id) {
      throw new ForbiddenError('You are not authorized to access this course');
    }

    const questions =
      await this.questionsRepository.getCourseQuestions(courseId);
    const students =
      await this.studentCourseStatsRepository.getStudentStatsByCourseId(
        courseId,
      );
    const files =
      await this.courseFileRepository.getCourseFilesByCourseId(courseId);

    return {
      course: {
        id: courseWithSession.id,
        title: courseWithSession.title,
        description: courseWithSession.description,
        contentText: courseWithSession.contentText,
        validatedQuestions: courseWithSession.validatedQuestions,
        createdAt: courseWithSession.createdAt,
      },
      questions: questions || [],
      students: (students || []).map(
        (student: StudentCourseStatsWithStudent) => ({
          id: student.student.id,
          name: student.student.name,
          email: student.student.email,
          photoUrl: student.student.photoUrl,
          correctAnswers: student.correctAnswers,
          attemptedQuestions: student.attemptedQuestions,
          lastAttemptAt: student.lastAttemptAt,
        }),
      ),
      files: files || [],
    };
  }
}
