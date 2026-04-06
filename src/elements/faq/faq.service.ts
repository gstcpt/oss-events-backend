import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class FAQService {
  constructor(private prisma: PrismaService, private logService: LogService) { }
  async createFAQ(createFAQDto: CreateFAQDto, currentUser: number) {
    try {
      const author = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
      if (!author) { throw new BadRequestException('User not found'); }
      const faqData: any = { ...createFAQDto };
      const faq = await this.prisma.client.faq.create({
        data: {
          question: faqData.question,
          answer: faqData.answer,
          faq_order: faqData.faqOrder,
          section_id: faqData.sectionId || null,
          company_id: author.role_id?.toString() === '1' ? faqData.companyId : author.company_id,
          status: faqData.status || 1
        }
      });
      await this.logService.createLogForUserAction(Number(author.id), 'faq', Number(faq.id), 'create', 'FAQ created:' + faq.id);
      return faq;
    } catch (error) { throw new BadRequestException('Error creating FAQ: ' + error.message); }
  }

  async findAllFAQs(currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
      if (!user) { throw new BadRequestException('User not found'); }
      let faqs;
      if (user.role_id?.toString() === '1') { faqs = await this.prisma.client.faq.findMany({ orderBy: { id: 'desc' } }); }
      else if (user.role_id?.toString() === '2') { faqs = await this.prisma.client.faq.findMany({ where: { OR: [{ company_id: user.company_id }, { company_id: null }] }, orderBy: { id: 'desc' } }); }
      else { faqs = await this.prisma.client.faq.findMany({ where: { company_id: user.company_id }, orderBy: { id: 'desc' } }); }
      return faqs;
    } catch (error) { throw new BadRequestException('Error getting FAQs: ' + error.message); }
  }

  async findOneFAQ(id: number, currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
      if (!user) { throw new BadRequestException('User not found'); }
      const faq = await this.prisma.client.faq.findUnique({ where: { id } });
      if (!faq) { throw new BadRequestException('FAQ not found'); }
      if (user.role_id?.toString() !== '1' && user.role_id?.toString() !== '2' && faq.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You do not have permission to view this FAQ'); }
      return faq;
    } catch (error) { throw new BadRequestException('Error getting FAQ: ' + error.message); }
  }

  async updateFAQ(id: number, updateFAQDto: UpdateFAQDto, currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
      if (!user) { throw new BadRequestException('User not found'); }
      const updateData: any = { ...updateFAQDto };
      const existingFAQ = await this.prisma.client.faq.findUnique({ where: { id } });
      if (!existingFAQ) { throw new BadRequestException('FAQ not found'); }
      if (user.role_id?.toString() !== '1' && user.role_id?.toString() !== '2' && existingFAQ.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You do not have permission to update this FAQ'); }
      if (user.role_id?.toString() === '2' && existingFAQ.company_id === null && updateData.companyId !== undefined) { updateData.companyId = null; }
      const companyIdVal = user.role_id?.toString() === '1' || user.role_id?.toString() === '2' ? (updateData.companyId !== undefined ? updateData.companyId : existingFAQ.company_id) : user.company_id;
      const result = await this.prisma.client.faq.update({
        where: { id },
        data: {
          question: updateData.question,
          answer: updateData.answer,
          faq_order: updateData.faqOrder,
          section_id: updateData.sectionId !== undefined ? updateData.sectionId : existingFAQ.section_id,
          company_id: companyIdVal,
        }
      });
      await this.logService.createLogForUserAction(Number(user.id), 'faq', id, 'update', 'FAQ updated:' + id);
      return result;
    } catch (error) { throw new BadRequestException('Error updating FAQ: ' + error.message); }
  }

  async deleteFAQ(id: number, currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
      if (!user) { throw new BadRequestException('User not found'); }
      const existingFAQ = await this.prisma.client.faq.findUnique({ where: { id } });
      if (!existingFAQ) { throw new BadRequestException('FAQ not found'); }
      if (user.role_id?.toString() === '2' && user.company_id) { if (existingFAQ?.company_id && existingFAQ?.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You are not authorized to delete this FAQ'); } }
      else if (user.role_id?.toString() !== '1' && existingFAQ.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You are not authorized to delete this FAQ'); }
      const result = await this.prisma.client.faq.delete({ where: { id } });
      await this.logService.createLogForUserAction(Number(user.id), 'faq', id, 'delete', 'FAQ deleted:' + id);
      return result;
    } catch (error) { throw new BadRequestException('Error deleting FAQ: ' + error.message); }
  }
}