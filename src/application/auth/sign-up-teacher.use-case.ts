import { Inject, Injectable } from "@nestjs/common";

import { SignUpTeacherBody } from "../../domain/auth/sign-up.type";
import { AUTH_REPOSITORY, type AuthRepository } from "../../interfaces/persistence/auth.repository";
import { InvitationToken } from "../../domain/auth/invitation.type";

@Injectable()
export class SignUpTeacherUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: AuthRepository,
    ) {}

    async execute(body: SignUpTeacherBody): Promise<void> {
        const { token, email, password, firstname, lastname } = body;

        const invitationToken: InvitationToken = await this.authRepository.valideInvitationToken(token, email);
        await this.authRepository.createTeacher(email, password, firstname, lastname, invitationToken);

        return;
    }
}