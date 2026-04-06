import { IsEmail, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User email', required: true, example: 'a.boukadida@gst.com.tn' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', required: true, example: 'Ahmed123*' })
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Origin of the request', required: false, example: 'http://localhost:3001' })
  @IsNotEmpty()
  origin: string;
}