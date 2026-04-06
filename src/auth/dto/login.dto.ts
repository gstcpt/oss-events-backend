import { IsEmail, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User email', required: true, example: 'email@exemple.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', required: true, example: 'password' })
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Origin of the request', required: false, example: 'domain.com' })
  @IsNotEmpty()
  origin: string;
}