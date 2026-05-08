import { Module } from "@nestjs/common";
import { MailerModule } from "src/infrastructure/mailer/mailer.module";
import { EmailController } from "./email.controller";
import { SendInvitationUseCase } from "src/application/auth/send-invitation.use-case";
import { AuthPersistenceModule } from "src/infrastructure/supabase/auth/auth-persistence.module";

@Module({
  imports: [
    MailerModule,
    AuthPersistenceModule,
],
  controllers: [EmailController],
  providers: [SendInvitationUseCase],
})
export class EmailModule {}