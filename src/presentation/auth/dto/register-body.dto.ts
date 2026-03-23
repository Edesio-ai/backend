import { Equals, IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterBody {
    @IsString()
    @IsNotEmpty()
    @IsIn(['teacher', 'establishment', 'student', 'standalone'])
    role: 'teacher' | 'establishment' | 'student' | 'standalone';

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(12, { message: 'Password must contain at least 12 characters' })
    @MaxLength(128)
    @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
    {
        message:
        'Password must contain a lowercase letter, an uppercase letter, a number and a special character',
    },
    )
    password: string;

    @IsString()
    @IsNotEmpty()
    firstname: string;

    @IsString()
    @IsNotEmpty()
    lastname: string;

    @IsBoolean()
    @Equals(true, { message: 'You must accept the terms and conditions' })
    acceptTerms: boolean;

    @IsString()
    @IsOptional()
    establishment?: string
}