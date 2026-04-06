import { PartialType } from '@nestjs/swagger';
import { CreateAudienceDto } from './createaudiance.dto';

export class UpdateAudienceDto extends PartialType(CreateAudienceDto) {}