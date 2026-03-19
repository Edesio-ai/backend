import { Controller, Get } from '@nestjs/common';
import { AppService } from '../../application/auth/auth.use-case';

@Controller()
export class AuthController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
