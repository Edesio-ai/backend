import { Inject } from '@nestjs/common';
import {
  ESTABLISHMENT_REPOSITORY,
  type EstablishmentRepository,
} from 'src/domain/teaching/interface/establishment.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/global/errors/global.errors';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/domain/teaching/interface/questions.repository';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interface/student.repository';
import {
  FILE_REPOSITORY,
  type FileRepository,
} from 'src/domain/teaching/interface/file.repository';
import { StudentCourseStatsWithStudent } from 'src/domain/teaching/types/student.type';
import { CourseDetails } from 'src/domain/teaching/types/course.type';

export class GetCourseDetailsUseCase {
  constructor(
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: EstablishmentRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly coursesRepository: CourseRepository,
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentsRepository: StudentRepository,
    @Inject(FILE_REPOSITORY)
    private readonly filesRepository: FileRepository,
  ) {}

  async execute(courseId: string, user: AuthUser): Promise<CourseDetails> {
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
      await this.studentsRepository.getStudentStatsByCourseId(courseId);
    const files = await this.filesRepository.getCourseFilesByCourseId(courseId);

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
