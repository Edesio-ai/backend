import { Inject } from '@nestjs/common';
import { StudentRepository } from '../../../../domain/teaching/interface/student.repository';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { StudentMapper } from '../mappers/student.mapper';
import { mapList } from '../../common/mapper.util';
import {
  InsertStudent,
  SessionStudent,
  Student,
  StudentCourseStats,
  StudentJoinedSession,
} from 'src/domain/teaching/types/student.type';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';
import { AuthUser } from 'src/domain/auth/types/auth.type';

export class StudentSupabaseRepository implements StudentRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: any,
  ) {}

  public async getStudentsSessionsByIds(sessionIds: string[]) {
    const { data, error } = await this.supabase
      .from('student_sessions')
      .select('session_id, student_id')
      .in(
        'session_id',
        sessionIds.length > 0
          ? sessionIds
          : ['00000000-0000-0000-0000-000000000000'],
      );

    if (error) {
      console.error(
        'An error occurred while getting students sessions by ids',
        sessionIds,
        error,
      );
      throw new ServerError(error.message);
    }
    return mapList(data ?? [], StudentMapper.sessionToDomain);
  }

  public async deleteStudentSessionsBySessionId(
    sessionId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('student_sessions')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      console.error(
        'An error occurred while deleting student sessions by session id',
        sessionId,
        error,
      );
      throw new ServerError(error.message);
    }
  }

  public async getStudentStatsByCourseId(
    courseId: string,
  ): Promise<StudentCourseStats[]> {
    const { data, error } = await this.supabase
      .from('student_course_stats')
      .select(
        `
        student_id,
        attempted_questions,
        correct_answers,
        last_attempt_at,
        students (
          id,
          name,
          email,
          photo_url
        )
      `,
      )
      .eq('course_id', courseId);

    if (error) {
      console.error(
        'An error occurred while getting student stats by course id',
        courseId,
        error,
      );
      throw new ServerError(error.message);
    }
    return mapList(data ?? [], StudentMapper.courseStatToDomain);
  }

  public async deleteStudentCourseStatsByCourseId(
    courseId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('student_course_stats')
      .delete()
      .eq('course_id', courseId);

    if (error) {
      console.error(
        'Error deleting student course stats for course id: ',
        courseId,
        error,
      );
      throw new ServerError(error.message);
    }
  }

  public async getStudentByUserId(userId: string): Promise<Student | null> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .eq('supabase_user_id', userId)
      .maybeSingle();

    if (error) {
      console.error(
        'An error occurred while getting student by user id',
        userId,
        error,
      );
      throw new ServerError(error.message);
    }
    return data ? StudentMapper.toDomain(data) : null;
  }

  public async createStudent(user: AuthUser): Promise<Student> {
    const name =
      user.metadata?.firstname && user.metadata?.lastname
        ? `${user.metadata.firstname} ${user.metadata.lastname}`
        : user.metadata?.firstname || 'Élève';

    const studentDataToInsert: InsertStudent = {
      supabaseUserId: user.id,
      name,
      email: user.email || '',
    };

    const { data, error } = await this.supabase
      .from('students')
      .insert(StudentMapper.toInsert(studentDataToInsert))
      .select()
      .single();

    if (error) {
      console.error(
        'An error occurred while creating student',
        studentDataToInsert,
        error,
      );
      throw new ServerError(error.message);
    }

    return StudentMapper.toDomain(data);
  }

  public async getStudentJoinedSessions(
    studentId: string,
  ): Promise<StudentJoinedSession[]> {
    const { data, error } = await this.supabase
      .from('student_sessions')
      .select('joined_at, sessions (*)')
      .eq('student_id', studentId)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error(
        'An error occurred while getting student joined sessions',
        studentId,
        error,
      );
      throw new ServerError(error.message);
    }
    return mapList(data ?? [], StudentMapper.joinedSessionToDomain);
  }

  public async createStudentSession(
    studentId: string,
    sessionId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('student_sessions')
      .insert({ student_id: studentId, session_id: sessionId });

    if (error) {
      console.error(
        'An error occurred while creating student session',
        studentId,
        sessionId,
      );
      throw new ServerError(error.message);
    }
  }

  public async getStudentsSessionsById(
    sessionId: string,
    select: string = '*',
  ): Promise<SessionStudent[]> {
    const { data, error } = await this.supabase
      .from('student_sessions')
      .select(select)
      .eq('session_id', sessionId);

    if (error) {
      console.error(
        'An error occurred while getting students sessions by id',
        sessionId,
        error,
      );
      throw new ServerError(error.message);
    }
    return mapList(data ?? [], StudentMapper.studentSessionToDomain);
  }
}
