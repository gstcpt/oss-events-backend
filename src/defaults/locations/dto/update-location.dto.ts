import { PartialType } from '@nestjs/swagger';
import { CreateCountryDto, CreateGovernorateDto, CreateMunicipalityDto } from './create-location.dto';

export class UpdateCountryDto extends PartialType(CreateCountryDto) { }
export class UpdateGovernorateDto extends PartialType(CreateGovernorateDto) { }
export class UpdateMunicipalityDto extends PartialType(CreateMunicipalityDto) { }