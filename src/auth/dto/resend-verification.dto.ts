import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationDto {
  @ApiProperty({ description: 'User email to resend verification to', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Frontend origin used to build verify link (optional)', required: false })
  origin?: string;
}