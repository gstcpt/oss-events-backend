import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateFaqSectionDto } from './dto/create-faq-section.dto';
import { UpdateFaqSectionDto } from './dto/update-faq-section.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class FaqSectionsService {
  constructor(private prisma: PrismaService, private logService: LogService) { }

  async create(createFaqSectionDto: CreateFaqSectionDto, currentUser: number) {
    try {
      const author = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
      if (!author) throw new BadRequestException('User not found');
      const data: any = { ...createFaqSectionDto };
      const companyId = author.role_id?.toString() === '1' ? data.companyId : author.company_id;
      const section = await this.prisma.client.faq_sections.create({ data: { title: data.title, company_id: companyId, status: data.status || 1 } });
      await this.logService.createLogForUserAction(Number(author.id), 'faq_sections', Number(section.id), 'create', 'FAQ Section created:' + section.id);
      return section;
    } catch (error) { throw new BadRequestException('Error creating FAQ Section: ' + error.message); }
  }

  async findAll(currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
      if (!user) throw new BadRequestException('User not found');
      let sections;
      if (user.role_id?.toString() === '1') { sections = await this.prisma.client.faq_sections.findMany({}); }
      else if (user.role_id?.toString() === '2') { sections = await this.prisma.client.faq_sections.findMany({ where: { OR: [{ company_id: user.company_id }, { company_id: null }] }, }); }
      else { sections = await this.prisma.client.faq_sections.findMany({ where: { company_id: user.company_id }, }); }
      return sections;
    } catch (error) { throw new BadRequestException('Error getting FAQ Sections: ' + error.message); }
  }

  async findOne(id: number, currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
      if (!user) throw new BadRequestException('User not found');
      const section = await this.prisma.client.faq_sections.findUnique({ where: { id } });
      if (!section) throw new BadRequestException('FAQ Section not found');
      if (user.role_id?.toString() !== '1' && user.role_id?.toString() !== '2' && section.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You do not have permission to view this FAQ Section'); }
      return section;
    } catch (error) { throw new BadRequestException('Error getting FAQ Section: ' + error.message); }
  }

  async update(id: number, updateFaqSectionDto: UpdateFaqSectionDto, currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
      if (!user) throw new BadRequestException('User not found');
      const existingSection = await this.prisma.client.faq_sections.findUnique({ where: { id } });
      if (!existingSection) throw new BadRequestException('FAQ Section not found');
      if (user.role_id?.toString() !== '1' && user.role_id?.toString() !== '2' && existingSection.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You do not have permission to update this FAQ Section'); }
      const updateData: any = { ...updateFaqSectionDto };
      if (user.role_id?.toString() === '2' && existingSection.company_id === null && updateData.companyId !== undefined) { updateData.companyId = null; }
      const companyIdVal = user.role_id?.toString() === '1' || user.role_id?.toString() === '2' ? (updateData.companyId !== undefined ? updateData.companyId : existingSection.company_id) : user.company_id;
      const result = await this.prisma.client.faq_sections.update({ where: { id }, data: { title: updateData.title, company_id: companyIdVal, status: updateData.status } });
      await this.logService.createLogForUserAction(Number(user.id), 'faq_sections', id, 'update', 'FAQ Section updated:' + id);
      return result;
    } catch (error) { throw new BadRequestException('Error updating FAQ Section: ' + error.message); }
  }

  async remove(id: number, currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
      if (!user) throw new BadRequestException('User not found');
      const existingSection = await this.prisma.client.faq_sections.findUnique({ where: { id } });
      if (!existingSection) throw new BadRequestException('FAQ Section not found');
      if (user.role_id?.toString() === '2' && user.company_id) {
        if (existingSection?.company_id && existingSection.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You are not authorized to delete this FAQ Section'); }
      }
      else if (user.role_id?.toString() !== '1' && existingSection.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You are not authorized to delete this FAQ Section'); }
      const result = await this.prisma.client.faq_sections.delete({ where: { id } });
      await this.logService.createLogForUserAction(Number(user.id), 'faq_sections', id, 'delete', 'FAQ Section deleted:' + id);
      return result;
    } catch (error) { throw new BadRequestException('Error deleting FAQ Section: ' + error.message); }
  }
}
