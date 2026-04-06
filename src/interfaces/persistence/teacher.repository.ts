export const TEACHER_REPOSITORY = Symbol('TEACHER_REPOSITORY');

export interface TeacherRepository {
  getTeacherByEstablishmentId(establishmentId: string): Promise<any>;
  getTeachersSessionsByIds(teacherIds: string[]): Promise<any>;
}
