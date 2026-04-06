import { IsString, IsEmail, IsOptional, MinLength, IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User first name', required: false })
  @IsString()
  @IsOptional()
  firstname?: string;

  @ApiProperty({ description: 'User middle name', required: false })
  @IsString()
  @IsOptional()
  midname?: string;

  @ApiProperty({ description: 'User last name', required: false })
  @IsString()
  @IsOptional()
  lastname?: string;

  @ApiProperty({ description: 'User avatar', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'User username', required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'User email', required: true })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ description: 'User password', required: true })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'User status', required: false, default: 1 })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({ description: 'Company ID', required: false })
  @IsNumber()
  @IsOptional()
  company_id?: number;

  @ApiProperty({ description: 'Role ID', required: false })
  @IsNumber()
  @IsOptional()
  role_id?: number;
}