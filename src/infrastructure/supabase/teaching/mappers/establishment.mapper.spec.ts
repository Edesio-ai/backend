import {
  createEstablishmentBodyToSupabaseEstablishmentInsert,
  supabaseEstablishmentToEstablishment,
} from './establishment.mapper';
import { SupabaseEstablishment } from 'src/domain/establishment/establishment.type';

describe('establishment.mapper', () => {
  describe('supabaseEstablishmentToEstablishment', () => {
    it('maps snake_case row to domain Establishment', () => {
      const row: SupabaseEstablishment = {
        id: 'est-1',
        supabase_user_id: 'user-1',
        name: 'Academy',
        email: 'contact@school.com',
        created_at: '2026-01-01T00:00:00.000Z',
      };

      expect(supabaseEstablishmentToEstablishment(row)).toEqual({
        id: 'est-1',
        supabaseUserId: 'user-1',
        name: 'Academy',
        email: 'contact@school.com',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('createEstablishmentBodyToSupabaseEstablishmentInsert', () => {
    it('maps create body to Supabase insert columns', () => {
      expect(
        createEstablishmentBodyToSupabaseEstablishmentInsert({
          supabaseUserId: 'user-2',
          name: 'New',
          email: 'new@edesio.io',
        }),
      ).toEqual({
        supabase_user_id: 'user-2',
        name: 'New',
        email: 'new@edesio.io',
      });
    });
  });
});
