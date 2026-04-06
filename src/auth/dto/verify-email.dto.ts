import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Email verification token', required: true })
  @IsString()
  @IsNotEmpty()
  token: string;
}