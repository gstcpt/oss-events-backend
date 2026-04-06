import { Module } from '@nestjs/common';
import { CompanyModule } from './companies/company.module';
import { UserModule } from './users/user.module';

@Module({ imports: [CompanyModule, UserModule] })
export class ActorsModule { }