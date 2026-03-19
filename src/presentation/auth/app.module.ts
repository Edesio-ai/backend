import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AppService } from 'src/application/auth/auth.use-case';


@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AppService],
})
export class AuthModule {}
