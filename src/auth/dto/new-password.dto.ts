import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewPasswordDto {
  @ApiProperty({ description: 'Password reset token', required: true })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'New password', required: true })
  @IsString()
  @MinLength(8)
  newPassword: string;
}