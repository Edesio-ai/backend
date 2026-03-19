import { BadRequestException } from '@nestjs/common';
import { GetInvitationPreviewUseCase } from './get-invitation-preview.use-case';
import { InvitationTokenRepository } from 'src/interfaces/persistence/invitation-token.repository';
import { InvitationTokenPreview } from 'src/domain/auth/invitation.type';

describe('GetInvitationPreviewUseCase', () => {
    let fixtures: Fixtures;

    beforeEach(() => {
        fixtures = new Fixtures();
    });

    it('should throw BadRequestException when token is empty', async () => {
        const promise = fixtures.whenExecuteWith('');

        await fixtures.thenThrowBadRequest(promise);
        fixtures.thenRepositoryNotCalled();
    });

    it('should return preview when token is valid', async () => {
        fixtures.whenRepositoryReturnsPreview();
        const result = await fixtures.whenExecuteWith('token-123');

        fixtures.thenRepositoryCalledWith('token-123');
        fixtures.thenReturnExpectedPreview(result);
    });

    it('should propagate repository errors', async () => {
        fixtures.whenRepositoryThrowsError();
        const promise = fixtures.whenExecuteWith('token-123');

        await fixtures.thenThrowRepositoryError(promise);
        fixtures.thenRepositoryCalledWith('token-123');
    });
});

class Fixtures {
    public readonly invitationTokenRepository: jest.Mocked<InvitationTokenRepository>;
    public readonly getInvitationPreviewUseCase: GetInvitationPreviewUseCase;

    public readonly token = 'token-123';
    public readonly preview: InvitationTokenPreview;
    public readonly repositoryError: Error;

    constructor() {
        this.invitationTokenRepository = {
            getInvitationPreview: jest.fn(),
        };

        this.getInvitationPreviewUseCase = new GetInvitationPreviewUseCase(this.invitationTokenRepository);

        this.preview = {
            valid: true,
            maskedEmail: 'j***@mail.com',
            etablissementNom: 'Mon Etablissement',
            chatbotsAlloues: 2,
        };

        this.repositoryError = new Error('DB down');
    }

    whenExecuteWith(token: string) {
        return this.getInvitationPreviewUseCase.execute(token);
    }

    whenRepositoryReturnsPreview() {
        this.invitationTokenRepository.getInvitationPreview.mockResolvedValue(this.preview);
    }

    whenRepositoryThrowsError() {
        this.invitationTokenRepository.getInvitationPreview.mockRejectedValue(this.repositoryError);
    }

    async thenThrowBadRequest(promise: Promise<unknown>) {
        await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    }

    async thenThrowRepositoryError(promise: Promise<unknown>) {
        await expect(promise).rejects.toBe(this.repositoryError);
    }

    thenRepositoryCalledWith(token: string) {
        expect(this.invitationTokenRepository.getInvitationPreview).toHaveBeenCalledWith(token);
        expect(this.invitationTokenRepository.getInvitationPreview).toHaveBeenCalledTimes(1);
    }

    thenRepositoryNotCalled() {
        expect(this.invitationTokenRepository.getInvitationPreview).not.toHaveBeenCalled();
    }

    thenReturnExpectedPreview(result: InvitationTokenPreview) {
        expect(result).toEqual(this.preview);
    }
}