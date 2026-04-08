import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase.module';
import { ESTABLISHMENT_REPOSITORY } from 'src/interfaces/persistence/establishment.repository';
import { EstablishmentSupabaseRepository } from './establishment-supabase.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: ESTABLISHMENT_REPOSITORY,
      useClass: EstablishmentSupabaseRepository,
    },
  ],
  exports: [ESTABLISHMENT_REPOSITORY],
})
export class EstablishmentPersistenceModule {}
