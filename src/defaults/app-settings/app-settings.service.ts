import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppSettingsDto } from './dto/create-app-settings.dto';
import { UpdateAppSettingsDto } from './dto/update-app-settings.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class AppSettingsService {
  constructor(private prisma: PrismaService, private logService: LogService) { }
  async create(createAppSettingsDto: CreateAppSettingsDto) {
    try {
      const appSettings = await this.prisma.client.app_settings.create({ data: createAppSettingsDto });
      await this.logService.createLogForUserAction(1, 'app_settings', Number(appSettings.id), 'create', `AppSettings created: ${appSettings.title} and value: ${appSettings.value}`);
      return ({ message: 'AppSettings created successfully', appSettings });
    }
    catch (error) { throw new BadRequestException('Error creating app settings', error.message); }
  }
  async findAll() {
    try {
      const appSettings = await this.prisma.client.app_settings.findMany();
      return ({ message: 'AppSettings found successfully', appSettings });
    }
    catch (error) { throw new BadRequestException('Error finding app settings', error); }
  }

  async findByFamille(famille: string) {
    try {
      const appSettings = await this.prisma.client.app_settings.findMany({ where: { famille } });
      return appSettings;
    }
    catch (error) { throw new BadRequestException('Error finding app settings by famille', error); }
  }
  async findOne(id: number) {
    try {
      const appSettings = await this.prisma.client.app_settings.findUnique({ where: { id } });
      if (!appSettings) throw new BadRequestException('AppSettings not found');
      return ({ message: 'AppSettings found successfully', appSettings });
    }
    catch (error) { throw new BadRequestException('Error finding app settings', error); }
  }
  async update(id: number, updateAppSettingsDto: UpdateAppSettingsDto) {
    try {
      const appSettings = await this.prisma.client.app_settings.update({ where: { id }, data: updateAppSettingsDto });
      await this.logService.createLogForUserAction(1, 'app_settings', Number(appSettings.id), 'update', `AppSettings updated: ${appSettings.title} and value: ${appSettings.value}`);
      return ({ message: 'AppSettings updated successfully', appSettings });
    }
    catch (error) { throw new BadRequestException('Error updating app settings', error); }
  }
  async remove(id: number) {
    try {
      const appSettings = await this.prisma.client.app_settings.delete({ where: { id } });
      await this.logService.createLogForUserAction(1, 'app_settings', Number(appSettings.id), 'remove', `AppSettings deleted: ${appSettings.title} and value: ${appSettings.value}`);
      return ({ message: 'AppSettings deleted successfully', appSettings });
    }
    catch (error) { throw new BadRequestException('Error deleting app settings', error); }
  }
}