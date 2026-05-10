import { SupabaseEstablishment } from 'src/domain/teaching/establishment/types/establishment.type';
import { EstablishmentMapper } from './establishment.mapper';

describe('EstablishmentMapper', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('toDomain', () => {
    it('maps snake_case row to domain Establishment', () => {
      const result = fixtures.whenToDomain();

      fixtures.thenReturnsExpectedEstablishment(result);
    });
  });

  describe('toInsert', () => {
    it('maps create body to Supabase insert columns', () => {
      const result = fixtures.whenToInsert();

      fixtures.thenReturnsExpectedInsert(result);
    });
  });
});

class Fixtures {
  public readonly supabaseRow: SupabaseEstablishment = {
    id: 'est-1',
    supabase_user_id: 'user-1',
    name: 'Academy',
    email: 'contact@school.com',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly expectedEstablishment = {
    id: 'est-1',
    supabaseUserId: 'user-1',
    name: 'Academy',
    email: 'contact@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly insertBody = {
    supabaseUserId: 'user-2',
    name: 'New',
    email: 'new@edesio.io',
  };

  public readonly expectedInsert = {
    supabase_user_id: 'user-2',
    name: 'New',
    email: 'new@edesio.io',
  };

  whenToDomain() {
    return EstablishmentMapper.toDomain(this.supabaseRow);
  }

  whenToInsert() {
    return EstablishmentMapper.toInsert(this.insertBody);
  }

  thenReturnsExpectedEstablishment(result: unknown) {
    expect(result).toEqual(this.expectedEstablishment);
  }

  thenReturnsExpectedInsert(result: unknown) {
    expect(result).toEqual(this.expectedInsert);
  }
}
