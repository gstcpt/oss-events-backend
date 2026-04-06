import { IsOptional, IsNotEmpty, IsString, IsEmail, IsBoolean, IsNumber, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({ description: 'User ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  user_id?: number;

  @ApiProperty({ description: 'Category ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  category_id?: number;

  @ApiProperty({ description: 'Provider type', required: true, example: '1 = Physical, 2 = Company' })
  @IsNumber()
  @IsNotEmpty()
  type_provider?: number;

  @ApiProperty({ description: 'Provider ste title', required: true, example: 'Sghaier Events' })
  @IsString()
  @IsNotEmpty()
  ste_title?: string;

  @ApiProperty({ description: 'Provider logo', required: true, example: '' })
  @IsString()
  @IsNotEmpty()
  logo?: string;

  @ApiProperty({ description: 'Provider tarification', required: false, example: '500' })
  @IsString()
  @IsOptional()
  tarification?: string;

  @ApiProperty({ description: 'Provider email', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Provider phone number', required: false, example: '0021690000000' })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ description: 'Provider whatsapp', required: false, example: '0021690000000' })
  @IsString()
  @IsOptional()
  whatsapp?: string;

  @ApiProperty({ description: 'Provider fix_phone', required: false, example: '0021670000000' })
  @IsString()
  @IsOptional()
  fix_phone?: string;

  @ApiProperty({ description: 'Provider fax', required: false, example: '0021670000000' })
  @IsString()
  @IsOptional()
  fax?: string;

  @ApiProperty({ description: 'Provider country', required: false, example: 'Tunisia' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'Provider city', required: false, example: 'Tunis' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'Provider postal_code', required: false, example: '10000' })
  @IsString()
  @IsOptional()
  postal_code?: string;

  @ApiProperty({ description: 'Provider street', required: false, example: 'Rue fouln ben foulan' })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty({ description: 'Provider department', required: false, example: 'Imm x' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ description: 'Provider map_location', required: false, example: 'https://www.google.com/maps/place/123+Main+St,+Tunis,+Tunisia' })
  @IsString()
  @IsOptional()
  map_location?: string;

  @ApiProperty({ description: 'Country ID', required: false })
  @IsNumber()
  @IsOptional()
  country_id?: number;

  @ApiProperty({ description: 'Governorate ID', required: false })
  @IsNumber()
  @IsOptional()
  governorate_id?: number;

  @ApiProperty({ description: 'Municipality ID', required: false })
  @IsNumber()
  @IsOptional()
  municipality_id?: number;

  @ApiProperty({ description: 'Provider website', required: false, example: 'https://www.domain.com' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ description: 'Provider facebook', required: false, example: 'https://www.facebook.com/facebookpageid' })
  @IsString()
  @IsOptional()
  facebook?: string;

  @ApiProperty({ description: 'Provider instagram', required: false, example: 'https://www.instagram.com/instagramprofileid' })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiProperty({ description: 'Provider tiktok', required: false, example: 'https://www.tiktok.com/@tiktokusername' })
  @IsString()
  @IsOptional()
  tiktok?: string;

  @ApiProperty({ description: 'Provider youtube', required: false, example: 'https://www.youtube.com/youtubechannelid' })
  @IsString()
  @IsOptional()
  youtube?: string;

  @ApiProperty({ description: 'Provider experience', required: false, example: '10 ans d\'expérience' })
  @IsString()
  @IsOptional()
  experience?: string;

  @ApiProperty({ description: 'Provider foudation_date', required: false, example: 'yyyy-mm-dd' })
  @IsDate()
  @IsOptional()
  foudation_date?: Date;

  @ApiProperty({ description: 'Provider about', required: false, example: 'Description détaillée du prestataire' })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiProperty({ description: 'Provider policy', required: false, example: 'FAQ, payment, delivery, refund policy' })
  @IsString()
  @IsOptional()
  policy?: string;

  @ApiProperty({ description: 'Provider payment_en_especes', required: false, example: '0 if Non, 1 if Oui' })
  @IsNumber()
  @IsOptional()
  payment_en_especes?: number;

  @ApiProperty({ description: 'Provider payment_virement', required: false, example: '0 if Non, 1 if Oui' })
  @IsNumber()
  @IsOptional()
  payment_virement?: number;

  @ApiProperty({ description: 'Provider payment_par_cheque', required: false, example: '0 if Non, 1 if Oui' })
  @IsNumber()
  @IsOptional()
  payment_par_cheque?: number;
}