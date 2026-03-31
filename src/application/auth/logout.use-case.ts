import { Inject } from "@nestjs/common";
import { AUTH_REPOSITORY, type AuthRepository } from "../../interfaces/persistence/auth.repository";

export class LogoutUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: AuthRepository,
    ) { }

    async execute(accessToken: string): Promise<void> {
        await this.authRepository.logoutUser(accessToken);
        return;
    }
}