import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { CsrfGuard } from './csrf.guard';

@Injectable()
export class AppHttpSecurityGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly rolesGuard: RolesGuard,
    private readonly csrfGuard: CsrfGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const jwtOk = await this.jwtAuthGuard.canActivate(context);
    if (!jwtOk) {
      return false;
    }
    const rolesOk = await this.rolesGuard.canActivate(context);
    if (!rolesOk) {
      return false;
    }
    return this.csrfGuard.canActivate(context);
  }
}
