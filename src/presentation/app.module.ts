import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EstablishmentModule } from './establishment/establishment.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    EstablishmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
