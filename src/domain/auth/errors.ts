export abstract class AuthError extends Error {
    abstract readonly code: string;
    abstract readonly httpStatus: number;
}

export class InvitationTokenNotFoundError extends AuthError {
    readonly code = 'INVITATION_TOKEN_NOT_FOUND';
    readonly httpStatus = 404;
    constructor(message?: string) { super(message || 'Invitation token not found'); }
}

export class TokenUserNotFoundError extends AuthError {
    readonly code = 'TOKEN_USER_NOT_FOUND';
    readonly httpStatus = 401;
    constructor(message?: string) { super(message || 'Invalid or expired token'); }
}

export class InvitationTokenAlreadyUsedError extends AuthError {
    readonly code = 'INVITATION_TOKEN_ALREADY_USED';
    readonly httpStatus = 400;
    constructor(message?: string) { super(message || 'Invitation token already used'); }
}

export class InvitationTokenExpiredError extends AuthError {
    readonly code = 'INVITATION_TOKEN_EXPIRED';
    readonly httpStatus = 400;
    constructor(message?: string) { super(message || 'Invitation token expired'); }
}

export class InvitationTokenEmailMismatchError extends AuthError {
    readonly code = 'INVITATION_TOKEN_EMAIL_MISMATCH';
    readonly httpStatus = 403;
    constructor(message?: string) { super(message || 'Invitation email mismatch with the email provided'); }
}

export class UserAlereadyExistsError extends AuthError {
    readonly code = 'TEACHER_ALREADY_EXISTS';
    readonly httpStatus = 400;
    constructor(message?: string) { super(message || 'User already exists'); }
}

export class UserCreationError extends AuthError {
    readonly code = 'USER_CREATION_ERROR';
    readonly httpStatus = 400;
    constructor(message?: string) { super(message || 'User creation error'); }
}

export class UserCreationFailedError extends AuthError {
    readonly code = 'USER_CREATION_FAILED';
    readonly httpStatus = 500;
    constructor(message?: string) { super(message || 'User creation failed'); }
}

export class TeacherProfileCreationError extends AuthError {
    readonly code = 'TEACHER_PROFILE_CREATION_ERROR';
    readonly httpStatus = 500;
    constructor(message?: string) { super(message || 'Teacher profile creation error'); }
}

export class TokenUpdateError extends AuthError {
    readonly code = 'TOKEN_UPDATE_ERROR';
    readonly httpStatus = 500;
    constructor(message?: string) { super(message || 'Token update error'); }
}

export class UserLoginError extends AuthError {
    readonly code = 'USER_LOGIN_ERROR';
    readonly httpStatus = 401;
    constructor(message?: string) { super(message || 'User login error'); }
}

export class LogoutError extends AuthError {
    readonly code = 'LOGOUT_ERROR';
    readonly httpStatus = 500;
    constructor(message?: string) { super(message || 'Logout error'); }
}