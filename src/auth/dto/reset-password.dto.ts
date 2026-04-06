import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'User email', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @ApiProperty({ description: 'User origin url', required: true })
  @IsString()
  @MinLength(8)
  origin: string;
}