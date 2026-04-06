import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAudienceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  company_id?: number;
}