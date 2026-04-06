import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService, private logService: LogService) { }
  async create(createPermissionDto: CreatePermissionDto) {
    try {
      const permission = await this.prisma.client.permissions.create({ data: createPermissionDto });
      await this.logService.createLogForUserAction(Number(permission.id), 'permissions', Number(permission.id), 'create', `Permission created: ${permission}`);
      return { message: 'Permission created successfully', permission };
    } catch (error) { throw new BadRequestException('Error creating permission'); }
  }
  async findAll() { return this.prisma.client.permissions.findMany(); }
  async findOne(id: number) { return this.prisma.client.permissions.findUnique({ where: { id } }); }
  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    try {
      const permission = await this.prisma.client.permissions.update({ where: { id }, data: updatePermissionDto });
      await this.logService.createLogForUserAction(Number(permission.id), 'permissions', Number(permission.id), 'update', `Permission updated: ${permission}`);
      return { message: 'Permission updated successfully', permission };
    } catch (error) { throw new BadRequestException('Error updating permission'); }
  }
  async remove(id: number) {
    try {
      const permission = await this.prisma.client.permissions.delete({ where: { id } });
      await this.logService.createLogForUserAction(Number(permission.id), 'permissions', Number(permission.id), 'delete', `Permission deleted: ${permission}`);
      return { message: 'Permission deleted successfully', permission };
    } catch (error) { throw new BadRequestException('Error deleting permission'); }
  }
}