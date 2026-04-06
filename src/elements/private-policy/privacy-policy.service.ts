import { Injectable, BadRequestException } from '@nestjs/common';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class PrivacyPolicyService {
  constructor(private prisma: PrismaService, private logService: LogService) { }

  async createPrivacyPolicy(createPrivacyPolicyDto: CreatePrivacyPolicyDto, currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: Number(currentUser) } });
      if (!user) { throw new BadRequestException('User not found'); }
      const companyId = user.role_id?.toString() === '1' ? createPrivacyPolicyDto.companyId : user.company_id;
      if (!companyId) { throw new BadRequestException('Company ID is required'); }
      let policy = await this.prisma.client.privacy_policy.findFirst({ where: { company_id: BigInt(companyId) } });
      if (policy) {
        policy = await this.prisma.client.privacy_policy.update({ where: { id: policy.id }, data: { content: createPrivacyPolicyDto.content || '' } });
        await this.logService.createLogForUserAction(Number(user.id), 'privacy_policy', Number(policy.id), 'update', 'Privacy Policy updated:' + policy.id);
      } else {
        try {
          const maxIdResult = await this.prisma.client.privacy_policy.aggregate({ _max: { id: true } });
          const nextId = maxIdResult._max.id ? BigInt(maxIdResult._max.id) + BigInt(1) : BigInt(1);
          policy = await this.prisma.client.privacy_policy.create({ data: { id: nextId, content: createPrivacyPolicyDto.content || '', company_id: BigInt(companyId) } });
        } catch (createError) {
          policy = await this.prisma.client.privacy_policy.findFirst({ where: { company_id: BigInt(companyId) } });
          if (policy) { policy = await this.prisma.client.privacy_policy.update({ where: { id: policy.id }, data: { content: createPrivacyPolicyDto.content || '' } }); } else { throw createError; }
        }
        await this.logService.createLogForUserAction(Number(user.id), 'privacy_policy', Number(policy.id), 'create', 'Privacy Policy created/updated:' + policy.id);
      }
      return policy;
    } catch (error) { throw new BadRequestException('Error creating/updating Privacy Policy: ' + error.message); }
  }
  async findAllPrivacyPolicies(currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: Number(currentUser) } });
      if (!user) { throw new BadRequestException('User not found'); }
      let policies;
      if (user.role_id?.toString() === '1') { policies = await this.prisma.client.privacy_policy.findMany({}); }
      else if (user.role_id?.toString() === '2') { policies = await this.prisma.client.privacy_policy.findMany({ where: { OR: [{ company_id: user.company_id }, { company_id: null }] } }); }
      else { policies = await this.prisma.client.privacy_policy.findMany({ where: { company_id: user.company_id } }); }
      if (policies.length > 0) {
        for (let i = 0; i < policies.length; i++) {
          const created_at = await this.prisma.client.logs.findFirst({ where: { action: 'create', entity: 'privacy_policy', row_id: policies[i].id } });
          policies[i].created_at = created_at?.created_at;
          const updated_at = await this.prisma.client.logs.findFirst({ where: { action: 'update', entity: 'privacy_policy', row_id: policies[i].id } });
          policies[i].updated_at = updated_at?.created_at;
        }
      }
      return policies;
    } catch (error) { throw new BadRequestException('Error getting Privacy Policies: ' + error.message); }
  }
  async findOnePrivacyPolicy(id: number, currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: Number(currentUser) } });
      if (!user) { throw new BadRequestException('User not found'); }
      const policy = await this.prisma.client.privacy_policy.findUnique({ where: { id } });
      if (!policy) { throw new BadRequestException('Privacy Policy not found'); }
      if (user.role_id?.toString() !== '1' && user.role_id?.toString() !== '2' && policy.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You do not have permission to view this Privacy Policy'); }
      return policy;
    } catch (error) { throw new BadRequestException('Error getting Privacy Policy: ' + error.message); }
  }
  async updatePrivacyPolicy(id: number, updatePrivacyPolicyDto: UpdatePrivacyPolicyDto, currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: Number(currentUser) } });
      if (!user) { throw new BadRequestException('User not found'); }
      const existingPolicy = await this.prisma.client.privacy_policy.findUnique({ where: { id } });
      if (!existingPolicy) { throw new BadRequestException('Privacy Policy not found'); }
      if (user.role_id?.toString() !== '1' && user.role_id?.toString() !== '2' && existingPolicy.company_id?.toString() !== (user.company_id?.toString() || '')) { throw new BadRequestException('You do not have permission to update this Privacy Policy'); }
      const updateData: any = { ...updatePrivacyPolicyDto };
      if (user.role_id?.toString() === '2' && existingPolicy.company_id === null && updateData.companyId !== undefined) { updateData.companyId = null; }
      const companyIdValue = user.role_id?.toString() === '1' || user.role_id?.toString() === '2' ? (updateData.companyId !== undefined ? updateData.companyId : existingPolicy.company_id) : user.company_id;
      const result = await this.prisma.client.privacy_policy.update({ where: { id }, data: { content: updateData.content || '', company_id: companyIdValue } });
      await this.logService.createLogForUserAction(Number(user.id), 'privacy_policy', id, 'update', 'Privacy Policy updated:' + id);
      return result;
    } catch (error) { throw new BadRequestException('Error updating Privacy Policy: ' + error.message); }
  }
  async deletePrivacyPolicy(id: number, currentUser: number) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id: Number(currentUser) } });
      if (!user) { throw new BadRequestException('User not found'); }
      const existingPolicy = await this.prisma.client.privacy_policy.findUnique({ where: { id } });
      if (!existingPolicy) { throw new BadRequestException('Privacy Policy not found'); }
      if (user.role_id?.toString() === '2' && user.company_id) {
        if (existingPolicy?.company_id && existingPolicy?.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You are not authorized to delete this Privacy Policy'); }
      }
      else if (user.role_id?.toString() !== '1' && existingPolicy.company_id?.toString() !== (user.company_id?.toString() || '')) { throw new BadRequestException('You are not authorized to delete this Privacy Policy'); }
      const result = await this.prisma.client.privacy_policy.delete({ where: { id } });
      await this.logService.createLogForUserAction(Number(user.id), 'privacy_policy', id, 'delete', 'Privacy Policy deleted:' + id);
      return result;
    } catch (error) { throw new BadRequestException('Error deleting Privacy Policy: ' + error.message); }
  }
}