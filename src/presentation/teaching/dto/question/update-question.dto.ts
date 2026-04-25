import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdateQuestionDto {
    @IsString()
    @IsOptional()
    questionText?: string;

    @IsArray()
    @IsOptional()
    correctAnswer?: string[];

    @IsString()
    @IsOptional()
    explanation?: string;

    @IsString()
    @IsOptional()
    type?: 'qcm' | 'ouverte';

    @IsArray()
    @IsOptional()
    proposals?: string[];
}