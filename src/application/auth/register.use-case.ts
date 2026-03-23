import { Inject, Injectable } from "@nestjs/common";

import { AUTH_REPOSITORY, type AuthRepository } from "../../interfaces/persistence/auth.repository";
import { RegisterBody, UserMetadata } from "../../domain/auth/sign-up.type";
import { EMAIL_PROVIDER, type EmailProviderInterface } from "../../interfaces/mailer/email.provider";



@Injectable()
export class RegisterUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: AuthRepository,
        @Inject(EMAIL_PROVIDER)
        private readonly emailProvider: EmailProviderInterface,
    ) {}


    async execute(body: RegisterBody): Promise<void> {
        const { role, email, password, firstname, lastname, acceptTerms, establishment } = body;

        const metadata: UserMetadata = {
            role,
            firstname,
            lastname,
            acceptTerms,
        }

        if(role === 'student') {
            metadata.establishment = establishment;
        }

        await this.authRepository.createUser(email, password, metadata);
        await this.emailProvider.sendWelcomeEmail(email, firstname, role);

        return;
    }
}