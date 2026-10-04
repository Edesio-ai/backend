import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { NotFoundError, UnauthorizedError } from 'src/domain/shared/errors/global.errors';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { CourseDetails, CourseDetailsQuestion } from 'src/domain/teaching/course/types/course.type';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import {
  QUESTIONS_REPOSITORY,
  type IQuestionsRepository,
} from 'src/domain/teaching/question/contracts/i-questions.repository';
import { Question } from 'src/domain/teaching/question/types/question.type';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';
import {
  type IStudentCourseStatsRepository,
  STUDENT_COURSE_STATS_REPOSITORY,
} from 'src/domain/teaching/student-course-stats/contracts/i-student-course-stats.repository';
import { StudentCourseStatsWithStudent } from 'src/domain/teaching/student-course-stats/types/student-course-stats.type';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';

export class GetCourseDetailsUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: IQuestionsRepository,
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
    @Inject(STUDENT_COURSE_STATS_REPOSITORY)
    private readonly studentCourseStatsRepository: IStudentCourseStatsRepository,
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
  ) {}

  async execute(courseId: string, user: AuthUser): Promise<CourseDetails> {
    const course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }

    const session = await this.sessionRepository.getSessionById(course.sessionId);
    if (!session || session.teacherId !== teacher.id) {
      throw new UnauthorizedError('You are not allowed to access this course');
    }

    const [questions, files, courseStats, enrollments] = await Promise.all([
      this.questionsRepository.getCourseQuestions(courseId),
      this.courseFileRepository.getCourseFilesByCourseId(courseId),
      this.studentCourseStatsRepository.getStudentCourseStatsByCourseId(courseId),
      this.studentSessionRepository.getStudentsSessionsByIds([course.sessionId]),
    ]);

    const enrolledStudentIds = new Set(enrollments.map((enrollment) => enrollment.studentId));

    return {
      course: {
        ...course,
        description: course.description ?? null,
        contentText: course.contentText ?? null,
        createdAt: course.createdAt ?? '',
      },
      studentsCount: enrollments.length,
      studentsWhoUsedChatbotCount: this.countStudentsWhoUsedChatbot(courseStats, enrolledStudentIds),
      averageSuccessRate: this.computeAverageSuccessRate(courseStats),
      files: files ?? [],
      questions: this.toDetailsQuestions(questions ?? []),
    };
  }

  private countStudentsWhoUsedChatbot(stats: StudentCourseStatsWithStudent[], enrolledStudentIds: Set<string>): number {
    return stats.filter((stat) => enrolledStudentIds.has(stat.studentId) && Number(stat.attemptedQuestions) > 0).length;
  }

  private toDetailsQuestions(questions: Question[]): CourseDetailsQuestion[] {
    return questions.map((question) => ({
      id: question.id,
      courseId: question.courseId,
      type: question.type,
      questionText: question.questionText,
      proposals: Array.isArray(question.proposals) ? question.proposals.map(String) : [],
      correctAnswers: question.correctAnswers,
      explanation: question.explanation,
      createdAt: question.createdAt,
      positionOrder: question.positionOrder,
      cheatingDetectionEnabled: question.cheatingDetectionEnabled,
    }));
  }

  private computeAverageSuccessRate(stats: StudentCourseStatsWithStudent[]): number {
    const withAttempts = stats.filter((stat) => Number(stat.attemptedQuestions) > 0);
    if (withAttempts.length === 0) {
      return 0;
    }

    const totalRate = withAttempts.reduce((sum, stat) => {
      return sum + (Number(stat.correctAnswers) / Number(stat.attemptedQuestions)) * 100;
    }, 0);

    return Math.round(totalRate / withAttempts.length);
  }
}
