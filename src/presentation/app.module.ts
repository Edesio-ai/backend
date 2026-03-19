import { Module } from '@nestjs/common';
import { AuthModule } from './auth/app.module';


@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
