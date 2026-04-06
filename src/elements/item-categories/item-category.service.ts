import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateItemCategoryDto } from './dto/create-item-category.dto';
import { UpdateItemCategoryDto } from './dto/update-item-category.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class ItemCategoryService {
  constructor(private prisma: PrismaService, private logService: LogService) { }
  async create(createItemCategoryDto: CreateItemCategoryDto) {
    try {
      const itemCategory = await this.prisma.client.item_category.create({ data: createItemCategoryDto });
      await this.logService.createLogForUserAction(Number(itemCategory.id), 'item_category', Number(itemCategory.id), 'create', `Item category created: ${itemCategory}`);
      return { message: 'Item category created successfully', itemCategory };
    } catch (error) { throw new BadRequestException('Error creating item category'); }
  }
  async findAll() { return this.prisma.client.item_category.findMany(); }
  async findOne(id: number) { return this.prisma.client.item_category.findUnique({ where: { id } }); }
  async update(id: number, updateItemCategoryDto: UpdateItemCategoryDto) {
    try {
      const itemCategory = await this.prisma.client.item_category.update({ where: { id }, data: updateItemCategoryDto });
      await this.logService.createLogForUserAction(Number(itemCategory.id), 'item_category', Number(itemCategory.id), 'update', `Item category updated: ${itemCategory}`);
      return { message: 'Item category updated successfully', itemCategory };
    } catch (error) { throw new BadRequestException('Error updating item category'); }
  }
  async remove(id: number) {
    try {
      const itemCategory = await this.prisma.client.item_category.delete({ where: { id } });
      await this.logService.createLogForUserAction(Number(itemCategory.id), 'item_category', Number(itemCategory.id), 'delete', `Item category deleted: ${itemCategory}`);
      return { message: 'Item category deleted successfully', itemCategory };
    } catch (error) { throw new BadRequestException('Error deleting item category'); }
  }
}