import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EstablishmentModule } from './establishment/establishment.module';
import { BillingModule } from './billing/billing.module';
import { TeacherModule } from './teacher/teacher.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    EstablishmentModule,
    BillingModule,
    TeacherModule,
    SessionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
