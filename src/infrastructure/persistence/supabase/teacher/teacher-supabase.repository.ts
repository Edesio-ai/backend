import { Inject } from "@nestjs/common";
import { SUPABASE_ADMIN } from "../supabase.module";
import { TeacherRepository } from "../../../../interfaces/persistence/teacher.repository";
import { TeacherNotFoundError, TeacherSessionsNotFoundError } from "../../../../domain/teaching/error";

export class TeacherSupabaseRepository implements TeacherRepository {
    constructor(
        @Inject(SUPABASE_ADMIN)
        private readonly supabase: any,
    ) { }

    async getTeacherByEstablishmentId(establishmentId: string): Promise<any> {      
        const { data, error  } = await this.supabase
        .from("professeurs")
        .select("id, nom, email, created_at")
        .eq("etablissement_id", establishmentId);

      if (error) {
        throw new TeacherNotFoundError(error.message);
      }
      return data;
    }

    async getTeachersSessionsByIds(teacherIds: string[]): Promise<any> {
        const { data, error  } = await this.supabase
        .from("sessions")
        .select("id, nom, code, langue, professeur_id, created_at")
        .in("professeur_id", teacherIds.length > 0 ? teacherIds : ['00000000-0000-0000-0000-000000000000']);
        
        if (error) {
            throw new TeacherSessionsNotFoundError(error.message);
        }
        return data;
    }
}