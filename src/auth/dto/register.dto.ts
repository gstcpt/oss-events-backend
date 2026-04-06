import { IsString, IsEmail, IsOptional, IsPhoneNumber, MinLength, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'User first name', required: false })
  @IsString()
  @IsOptional()
  firstname?: string;

  @ApiProperty({ description: 'User last name', required: false })
  @IsString()
  @IsOptional()
  lastname?: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'User username', required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'User email', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', required: true })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'User origin url', required: true })
  @IsString()
  @MinLength(8)
  origin: string;

  @ApiProperty({ description: 'User role id', required: false, default: 3, example: '2 Provider, 3 Client' })
  @IsOptional()
  @IsNumber()
  role_id?: number;
}