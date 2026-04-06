import { Module } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { RolePermissionController } from './role-permission.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RolePermissionController],
  providers: [RolePermissionService],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}