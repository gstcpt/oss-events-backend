import { CreateFAQDto } from './create-faq.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateFAQDto extends PartialType(CreateFAQDto) {}