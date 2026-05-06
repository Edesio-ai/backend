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
  StudentCourseStatsWithStudent,
  StudentJoinedSession,
  StudentSession,
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
  ): Promise<StudentCourseStatsWithStudent[]> {
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

  public async getStudentSessionsBySessionId(
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

  public async getStudentsByIds(studentIds: string[]): Promise<Student[]> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .in('id', studentIds);

    if (error) {
      console.error(
        'An error occurred while getting students by ids',
        studentIds,
        error,
      );
      throw new ServerError(error.message);
    }
    return mapList(data ?? [], StudentMapper.toDomain);
  }

  public async storeStudentPhoto(
    buffer: Buffer,
    storagePath: string,
  ): Promise<string> {
    const { error } = await this.supabase.storage
      .from('profile-photos')
      .upload(storagePath, buffer, { upsert: true });

    if (error) {
      console.error('Error uploading photo:', error);
      throw new ServerError(error.message);
    }

    const { data } = await this.supabase.storage
      .from('profile-photos')
      .getPublicUrl(storagePath);

    return data.publicUrl ?? '';
  }

  public async updateStudentPhoto(
    studentId: string,
    photoUrl: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('students')
      .update({ photo_url: photoUrl })
      .eq('id', studentId);

    if (error) {
      console.error(
        'An error occurred while updating student photo',
        studentId,
        photoUrl,
        error,
      );
      throw new ServerError(error.message);
    }
  }

  public async getStudentSessionBySessionId(
    sessionId: string,
  ): Promise<StudentSession | null> {
    const { data, error } = await this.supabase
      .from('student_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      console.error(
        'An error occurred while getting student session by session id',
        sessionId,
        error,
      );
      throw new ServerError(error.message);
    }
    return data ? StudentMapper.sessionToDomain(data) : null;
  }

  public async deleteStudentSession(
    sessionId: string,
    studentId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('student_sessions')
      .delete()
      .eq('session_id', sessionId)
      .eq('student_id', studentId);

    if (error) {
      console.error(
        `Error deleting student session for session id: ${sessionId} and student id: ${studentId}`,
        error,
      );
      throw new ServerError(error.message);
    }
  }

  public async getStudentCourseStatsByStudentIdAndCourseId(
    studentId: string,
    courseId: string,
  ): Promise<StudentCourseStats | null> {
    const { data, error } = await this.supabase
      .from('student_course_stats')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) {
      console.error(
        `Error getting student course stats by student id and course id: ${studentId} and ${courseId}`,
        error,
      );
      throw new ServerError(error.message);
    }
    return data ? StudentMapper.studentCourseStatToDomain(data) : null;
  }

  public async createStudentCourseStats(
    statToInsert: Omit<StudentCourseStats, 'id'>,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('student_course_stats')
      .insert(StudentMapper.studentCourseStatToInsert(statToInsert));

    if (error) {
      console.error('Error creating student course stats', statToInsert, error);
      throw new ServerError(error.message);
    }
  }

  public async updateStudentCourseStats(
    statId: string,
    statToUpdate: Omit<StudentCourseStats, 'id'>,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('student_course_stats')
      .update(StudentMapper.studentCourseStatToUpdate(statToUpdate))
      .eq('id', statId);

    if (error) {
      console.error('Error updating student course stats', statToUpdate, error);
      throw new ServerError(error.message);
    }
  }
}
