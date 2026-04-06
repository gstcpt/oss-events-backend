import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService, private logService: LogService) { }
  async create(createCategoryDto: CreateCategoryDto, userId: number) {
    try {
      const { head_category_id, company_id, ...rest } = createCategoryDto;
      const data: any = { ...rest };
      if (head_category_id) { data.parent_category = { connect: { id: head_category_id } }; }
      if (company_id) { data.companies = { connect: { id: company_id } }; }
      const category = await this.prisma.client.categories.create({ data });
      await this.logService.createLogForUserAction(Number(userId), 'categories', Number(category.id), 'create', `Category created: ${JSON.stringify(category)}`);
      return { message: 'Category created successfully', category };
    } catch (error) { throw new BadRequestException('Error creating category'); }
  }
  async findAll() { return this.prisma.client.categories.findMany({ include: { children: true, category_tags: true, companies: true } }); }
  async findAllByCompany(companyId: number) {
    try { return this.prisma.client.categories.findMany({ where: { company_id: companyId }, include: { children: true, category_tags: true, companies: true } }); }
    catch (error) { throw new BadRequestException('Error finding categories by company'); }
  }
  async findAllSubCategories(parentId: number) { return this.prisma.client.categories.findMany({ where: { head_category_id: parentId }, include: { children: true, category_tags: true, companies: true } }); }
  async findOne(id: number) { return this.prisma.client.categories.findUnique({ where: { id }, include: { children: true, category_tags: true, companies: true } }); }
  async update(id: number, updateCategoryDto: UpdateCategoryDto, userId: number) {
    try {
      const { head_category_id, company_id, ...rest } = updateCategoryDto;
      const data: any = { ...rest };
      if (head_category_id) { data.parent_category = { connect: { id: head_category_id } }; } else if (head_category_id === null) { data.parent_category = { disconnect: true }; }
      if (company_id) { data.companies = { connect: { id: company_id } }; } else if (company_id === null) { data.companies = { disconnect: true }; }
      const category = await this.prisma.client.categories.update({ where: { id }, data });
      await this.logService.createLogForUserAction(Number(userId), 'categories', Number(category.id), 'update', `Category updated: ${JSON.stringify(category)}`);
      return { message: 'Category updated successfully', category };
    } catch (error) { throw new BadRequestException('Error updating category'); }
  }
  async remove(id: number, userId: number) {
    try {
      const category = await this.prisma.client.categories.delete({ where: { id } });
      await this.logService.createLogForUserAction(Number(userId), 'categories', Number(category.id), 'delete', `Category deleted: ${JSON.stringify(category)}`);
      return { message: 'Category deleted successfully' };
    } catch (error) { throw new BadRequestException('Error deleting category'); }
  }
}