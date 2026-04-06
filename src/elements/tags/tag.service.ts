import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService, private logService: LogService) { }

  async create(createTagDto: CreateTagDto, currentUser: any) {
    try {
      const { category_ids, ...tagData } = createTagDto;
      const tag = await this.prisma.client.tags.create({ data: tagData });
      if (category_ids && category_ids.length > 0) { await this.prisma.client.category_tags.createMany({ data: category_ids.map(categoryId => ({ tag_id: tag.id, category_id: categoryId })) }); }
      await this.logService.createLogForUserAction(Number(currentUser.id), 'tags', Number(tag.id), 'create', `Tag created: ${tag.title}`);
      return tag;
    } catch (error) { throw new BadRequestException('Error creating tag', error.message); }
  }
  async findAll(currentUserId: number) {
    const user = await this.prisma.client.users.findUnique({ where: { id: currentUserId } });
    if (!user || !user.role_id) { throw new BadRequestException('User not found'); }
    const userRole = await this.prisma.client.roles.findUnique({ where: { id: user.role_id } });
    if (!userRole) { throw new BadRequestException('User role not found'); }
    const whereClause = userRole.title !== 'Root' && user?.company_id ? { company_id: Number(user.company_id) } : {};
    return this.prisma.client.tags.findMany({ where: whereClause, include: { companies: true, tag_options: true, category_tags: { include: { categories: true } } }, orderBy: { id: 'desc' } });
  }
  async findOne(id: number) { return this.prisma.client.tags.findUnique({ where: { id }, include: { category_tags: { include: { categories: true } } } }); }
  async update(id: number, updateTagDto: UpdateTagDto, currentUser: any) {
    try {
      const { category_ids, ...tagData } = updateTagDto;
      const tag = await this.prisma.client.tags.update({ where: { id }, data: tagData });
      await this.prisma.client.category_tags.deleteMany({ where: { tag_id: id } });
      if (category_ids && category_ids.length > 0) { await this.prisma.client.category_tags.createMany({ data: category_ids.map(categoryId => ({ tag_id: id, category_id: categoryId })) }); }
      await this.logService.createLogForUserAction(Number(currentUser.id), 'tags', Number(tag.id), 'update', `Tag updated: ${tag.title}`);
      return tag;
    } catch (error) { throw new BadRequestException('Error updating tag'); }
  }
  async remove(id: number, currentUser: any) {
    try {
      await this.prisma.client.category_tags.deleteMany({ where: { tag_id: id } });
      let tag = await this.prisma.client.tags.findUnique({ where: { id } });
      if (!tag) { throw new BadRequestException('Tag not found'); }
      tag = await this.prisma.client.tags.delete({ where: { id } });
      await this.logService.createLogForUserAction(Number(currentUser.id), 'tags', Number(tag.id), 'delete', `Tag deleted: ${tag.title}`);
      return tag;
    } catch (error) { throw new BadRequestException('Error deleting tag'); }
  }
  async findByCategory(categoryId: number, currentUser?: any) {
    const TagsIDs = await this.prisma.client.category_tags.findMany({ where: { category_id: categoryId } });
    const tags = await this.prisma.client.tags.findMany({ where: { id: { in: TagsIDs.map((item) => item.tag_id) } }, include: { tag_options: true }, orderBy: { id: 'desc' } });
    return tags;
  }
}