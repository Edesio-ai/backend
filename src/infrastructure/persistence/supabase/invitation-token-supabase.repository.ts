import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InvitationTokenRepository } from "src/interfaces/persistence/invitation-token.repository";
import { SUPABASE_ADMIN } from "./supabase.module";
import { InvitationTokenPreview } from "src/domain/auth/invitation.type";

@Injectable()
export class SupabaseInvitationTokenRepository
    implements InvitationTokenRepository {
    constructor(@Inject(SUPABASE_ADMIN) private readonly supabaseAdmin: any) { }

    public async getInvitationPreview(token: string): Promise<InvitationTokenPreview> {
        const { data, error } = await this.supabaseAdmin
            .from('invitation_tokens')
            .select(`
                id,
                invited_email,
                chatbots_alloues,
                expires_at,
                used_at,
                etablissements!inner ( nom )
            `)
            .eq('token', token)
            .single();

        if (error) {
            throw new NotFoundException("Invitation token not found", error.message);
        }

        if (data.used_at) {
            throw new BadRequestException("Invitation token already used");
        }

        const expiresAt = new Date(data.expires_at);
        
        if (expiresAt < new Date()) {
            throw new BadRequestException("Invitation token expired");
        }

        const maskedEmail = this.maskEmail(data.invited_email);

        return {
            valid: true,
            maskedEmail: maskedEmail,
            etablissementNom: data.etablissements.nom,
            chatbotsAlloues: data.chatbots_alloues,
        };
    }

    private maskEmail(email: string): string {
        const [localPart, domain] = email.split('@');
        if (!localPart || !domain) return '***';
        if (localPart.length <= 2) {
          return `${'*'.repeat(localPart.length)}@${domain}`;
        }
        const visibleStart = localPart[0];
        const visibleEnd = localPart[localPart.length - 1];
        const hidden = '*'.repeat(localPart.length - 2);
        return `${visibleStart}${hidden}${visibleEnd}@${domain}`;
    }
}