import { CreatePrivacyPolicyDto } from './create-privacy-policy.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdatePrivacyPolicyDto extends PartialType(CreatePrivacyPolicyDto) {}