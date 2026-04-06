import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService, private logService: LogService) { }

  async create(createModuleDto: CreateModuleDto, currentUser?: any) {
    try {
      const module = await this.prisma.client.modules.create({ data: createModuleDto });
      if (currentUser && currentUser.id) {
        try {
          const userId = Number(currentUser.id);
          if (!isNaN(userId) && userId > 0) {
            await this.logService.createLogForUserAction(userId, 'modules', Number(module.id), 'create', `Module created: ${module.title}`);
          }
        } catch (_) { /* log failure should not break the operation */ }
      }
      return ({ message: 'Module created successfully', module });
    } catch (error) { throw new BadRequestException('Error creating module', error.message); }
  }

  async findAll() {
    try {
      const modules = await this.prisma.client.modules.findMany({ include: { permissions: true } });
      return ({ message: 'Modules found successfully', modules });
    } catch (error) { throw new BadRequestException('Error fetching modules', error.message); }
  }

  async findOne(id: number) {
    try {
      const module = await this.prisma.client.modules.findUnique({ where: { id }, include: { permissions: true } });
      if (!module) throw new BadRequestException('Module not found')
      return ({ message: 'Module found successfully', module });
    } catch (error) { throw new BadRequestException('Error fetching module', error.message); }
  }

  async update(id: number, updateModuleDto: UpdateModuleDto, currentUser?: any) {
    try {
      const module = await this.prisma.client.modules.update({ where: { id }, data: updateModuleDto });
      if (currentUser && currentUser.id) {
        try {
          const userId = Number(currentUser.id);
          if (!isNaN(userId) && userId > 0) {
            await this.logService.createLogForUserAction(userId, 'modules', Number(module.id), 'update', `Module updated: ${module.title}`);
          }
        } catch (_) { /* log failure should not break the operation */ }
      }
      return ({ message: 'Module updated successfully', module });
    } catch (error) { throw new BadRequestException('Error updating module', error.message); }
  }

  async remove(id: number, currentUser?: any) {
    try {
      const module = await this.prisma.client.modules.delete({ where: { id } });
      if (currentUser && currentUser.id) {
        try {
          const userId = Number(currentUser.id);
          if (!isNaN(userId) && userId > 0) {
            await this.logService.createLogForUserAction(userId, 'modules', Number(module.id), 'remove', `Module deleted: ${module.title}`);
          }
        } catch (_) { /* log failure should not break the operation */ }
      }
      return ({ message: 'Module deleted successfully', module });
    } catch (error) { throw new BadRequestException('Error deleting module', error.message); }
  }
}