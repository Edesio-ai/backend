import { IsArray, IsString } from 'class-validator';

export class GetStudentBatchBodyDto {
  @IsArray()
  @IsString({ each: true })
  studentIds: string[];
}
