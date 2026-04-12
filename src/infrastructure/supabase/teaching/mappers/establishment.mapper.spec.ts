import {
  createEstablishmentBodyToSupabaseEstablishmentInsert,
  supabaseEstablishmentToEstablishment,
  supabaseInvitationTokenRowToInvitationToken,
} from './establishment.mapper';
import { SupabaseInvitationTokenRow } from 'src/domain/auth/invitation.type';
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

  describe('supabaseInvitationTokenRowToInvitationToken', () => {
    it('maps invitation_tokens row to InvitationToken', () => {
      const row: SupabaseInvitationTokenRow = {
        id: 'token-1',
        establishment_id: 'est-1',
        token: 'abc',
        invited_email: 'teacher@school.com',
        expires_at: '2026-04-01T00:00:00.000Z',
        used_at: null,
        used_by: null,
        created_at: '2026-03-28T00:00:00.000Z',
        assigned_chatbots: 2,
      };

      expect(supabaseInvitationTokenRowToInvitationToken(row)).toEqual({
        id: 'token-1',
        establishmentId: 'est-1',
        token: 'abc',
        invitedEmail: 'teacher@school.com',
        expiresAt: '2026-04-01T00:00:00.000Z',
        usedAt: null,
        usedBy: null,
        createdAt: '2026-03-28T00:00:00.000Z',
        assignedChatbots: 2,
      });
    });
  });
});
