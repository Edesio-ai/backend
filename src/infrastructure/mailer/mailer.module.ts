import { Module } from "@nestjs/common";

import { ResendEmailProvider } from "./resend-email.provider";
import { EMAIL_PROVIDER } from "src/interfaces/mailer/email.provider";
import { ResendModule } from "./resend.module";

@Module({
    imports: [ResendModule],
    providers: [
        {
            provide: EMAIL_PROVIDER,
            useClass: ResendEmailProvider,
        },
    ],
    exports: [EMAIL_PROVIDER],
})
export class MailerModule {}