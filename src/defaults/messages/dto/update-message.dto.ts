import { IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessageDto {
  @ApiProperty({ description: 'Message source ex. Internal, Contact', required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ description: 'Recipient email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Sender ID', required: false })
  @IsOptional()
  @IsNumber()
  sender_id?: number;

  @ApiProperty({ description: 'Receiver ID', required: false })
  @IsOptional()
  @IsNumber()
  receiver_id?: number;

  @ApiProperty({ description: 'Recipient name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Recipient phone', required: false })
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Message subject', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: 'Message body', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ description: 'Status for sender ex. 0 for draft, 1 for sent, 2 for trash from draft, 3 trash from sent', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  status_for_sender?: number;

  @ApiProperty({ description: 'Status for receiver ex. 0 for inbox unread, 1 for inbox read, 2 for trash unread, 3 for trash read', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  status_for_receiver?: number;

  @ApiProperty({ description: 'Company ID', required: false })
  @IsOptional()
  @IsNumber()
  company_id?: number;
}