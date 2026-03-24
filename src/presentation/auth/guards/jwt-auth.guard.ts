import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { AUTH_REPOSITORY, type AuthRepository } from "src/interfaces/persistence/auth.repository";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: AuthRepository,
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const auth = req.headers.authorization;
        if (!auth?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing bearer token');
        }
        const token = auth.slice(7);
        const user = await this.authRepository.validateToken(token);
        req.user = user;
        return true;
    }
}