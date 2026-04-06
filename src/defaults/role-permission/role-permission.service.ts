import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';

@Injectable()
export class RolePermissionService {
  constructor(private prisma: PrismaService) {}

  async create(createRolePermissionDto: CreateRolePermissionDto) {
    return this.prisma.client.role_permission.create({
      data: {
        role_id: createRolePermissionDto.roleId,
        permission_id: createRolePermissionDto.permissionId,
      },
    });
  }

  async findAll() {
    return this.prisma.client.role_permission.findMany();
  }

  async findOne(id: number) {
    return this.prisma.client.role_permission.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateRolePermissionDto: UpdateRolePermissionDto) {
    return this.prisma.client.role_permission.update({
      where: { id },
      data: updateRolePermissionDto,
    });
  }

  async remove(id: number) {
    return this.prisma.client.role_permission.delete({
      where: { id },
    });
  }
}