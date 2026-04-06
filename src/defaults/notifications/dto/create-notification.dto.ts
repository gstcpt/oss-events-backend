import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Actor ID (sender)', required: false })
  @IsOptional()
  @IsNumber()
  actor_id?: number;

  @ApiProperty({ description: 'Receiver ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  receiver_id: number;

  @ApiProperty({ description: 'Notification message', required: true })
  @IsString()
  @IsNotEmpty()
  notification: string;

  @ApiProperty({ description: 'Status', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  status?: number;
}