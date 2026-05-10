import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../../supabase.module';
import { mapList } from '../../../common/mapper.util';
import { InsertStudent, Student } from 'src/domain/teaching/types/student.type';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { StudentRepository } from 'src/domain/teaching/interfaces/student.repository';
import { StudentMapper } from '../mappers/student.mapper';

export class StudentSupabaseRepository implements StudentRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

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

    const { data } = this.supabase.storage
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
}
