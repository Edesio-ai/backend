import { Module } from "@nestjs/common";
import { SessionController } from "./session.controller";
import { AuthPersistenceModule } from "src/infrastructure/persistence/supabase/auth/auth-persistence.module";
import { GetTeacherSessionsUseCase } from "src/application/teacher/get-teacher-sessions.use-case";
import { TeacherPersistenceModule } from "src/infrastructure/persistence/supabase/teacher/teacher-persistence.module";
import { SessionsPersistenceModule } from "src/infrastructure/persistence/supabase/session/sessions-persistence.module";
import { CreateSessionUseCase } from "src/application/session/create-session.use-case";
import { UpdateSessionNameUseCase } from "src/application/session/update-session-name.use-case";
import { GetSessionByCodeUseCase } from "src/application/session/get-session-by-code.use-case";

@Module({
    imports: [
        AuthPersistenceModule,
        TeacherPersistenceModule,
        SessionsPersistenceModule,
    ],
    controllers: [SessionController],
    providers: [
        GetTeacherSessionsUseCase,
        CreateSessionUseCase,
        UpdateSessionNameUseCase,
        GetSessionByCodeUseCase,
    ],
})
export class SessionModule { }