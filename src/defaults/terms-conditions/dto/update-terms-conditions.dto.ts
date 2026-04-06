import { CreateTermsConditionsDto } from './create-terms-conditions.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateTermsConditionsDto extends PartialType(CreateTermsConditionsDto) {}