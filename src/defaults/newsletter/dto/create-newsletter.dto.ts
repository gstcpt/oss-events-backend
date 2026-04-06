import { IsEmail, IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateNewsletterDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  company_id?: number;
}