import { PartialType } from '@nestjs/swagger';
import { CreateFaqSectionDto } from './create-faq-section.dto';

export class UpdateFaqSectionDto extends PartialType(CreateFaqSectionDto) { }
