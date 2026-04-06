import { IsString, IsOptional, IsNumber, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'Message source ex. Internal, Contact', required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ description: 'Recipient email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Sender ID null if the message is from public contact fromulaire', required: true })
  @IsNumber()
  @IsNotEmpty()
  sender_id: number;

  @ApiProperty({ description: 'Receiver ID the admin id of the company that the public contact fromulaire send the message to', required: true })
  @IsNumber()
  @IsNotEmpty()
  receiver_id: number;

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
  subject: string;

  @ApiProperty({ description: 'Message body', required: false })
  @IsString()
  @IsOptional()
  message: string;

  @ApiProperty({ description: 'Status for sender ex. 0 for draft, 1 for sent, 2 for trash from draft, 3 trash from sent', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  status_for_sender?: number;

  @ApiProperty({ description: 'Status for receiver ex. 0 for inbox unread, 1 for inbox read, 2 for trash unread, 3 for trash read', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  status_for_receiver?: number;

  @ApiProperty({ description: 'Company ID the sender company id or the receiver company id if the message is from public contact fromulaire', required: false })
  @IsOptional()
  @IsNumber()
  company_id?: number;

  @ApiProperty({ description: 'Parent message id (for replies)', required: false })
  @IsOptional()
  @IsNumber()
  parent_message_id?: number;
}