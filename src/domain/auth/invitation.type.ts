export type InvitationTokenPreview = {
    isValid: true;
    maskedEmail: string;
    establishmentName: string;
    assignedChatbots: number;
};

export type InvitationToken = {
    id: string;
    establishment_id: string;
    token: string;
    invited_email: string;
    expires_at: string;
    used_at: string | null;
    used_by: string | null;
    created_at: string;
    assigned_chatbots: number;
}