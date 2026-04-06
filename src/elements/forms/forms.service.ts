import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFormsDto } from './dto/create-forms.dto';
import { UpdateFormsDto } from './dto/update-forms.dto';
import { LogService } from '../../common/services/log.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService, private logService: LogService) { }
  async create(createFormsDto: CreateFormsDto, user: any) {
    const toBigInt = (v: any) => {
      if (v === undefined || v === null) return undefined;
      try { return BigInt(v); } catch { return undefined; }
    };
    try {
      const { form_lines = [], ...formDataRaw } = createFormsDto;
      const formData: any = { ...formDataRaw };
      if (formData.company_id !== undefined && formData.company_id !== null) {
        const b = toBigInt(formData.company_id);
        if (b !== undefined) formData.company_id = b;
      }
      if (formData.category_id !== undefined && formData.category_id !== null) {
        const b = toBigInt(formData.category_id);
        if (b !== undefined) formData.category_id = b;
      }
      if (formData.status !== undefined && formData.status !== null) { formData.status = Number(formData.status); }
      if (user && user.company_id) formData.company_id = toBigInt(user.company_id);
      const tagIds = new Set<bigint>();
      const tagOptionIds = new Set<bigint>();
      for (const line of form_lines) {
        const tid = toBigInt(line.tag_id);
        if (tid !== undefined) tagIds.add(tid);
        if (Array.isArray(line.form_line_options)) {
          for (const opt of line.form_line_options) {
            const oid = toBigInt(opt.tag_option_id);
            if (oid !== undefined) tagOptionIds.add(oid);
          }
        }
      }
      const [existingTags, existingTagOptions] = await Promise.all([
        tagIds.size ? this.prisma.client.tags.findMany({ where: { id: { in: Array.from(tagIds) } }, select: { id: true } }) : Promise.resolve([]),
        tagOptionIds.size ? this.prisma.client.tag_options.findMany({ where: { id: { in: Array.from(tagOptionIds) } }, select: { id: true } }) : Promise.resolve([]),
      ]);
      const existingTagSet = new Set(existingTags.map((t) => t.id));
      const existingTagOptionSet = new Set(existingTagOptions.map((t) => t.id));
      const missingTags = Array.from(tagIds).filter((id) => !existingTagSet.has(id));
      const missingTagOptions = Array.from(tagOptionIds).filter((id) => !existingTagOptionSet.has(id));
      if (missingTags.length || missingTagOptions.length) {
        const parts: string[] = [];
        if (missingTags.length) parts.push(`Missing tag ids: [${missingTags.join(', ')}]`);
        if (missingTagOptions.length) parts.push(`Missing tag_option ids: [${missingTagOptions.join(', ')}]`);
        throw new BadRequestException(`Invalid references: ${parts.join('; ')}`);
      }
      const linesToCreate = await Promise.all((form_lines || []).map(async (line) => {
        const tagId = toBigInt(line.tag_id);
        const optionIds = (line.form_line_options || []).map(o => o.tag_option_id);
        const uniqueOptionIds = [...new Set(optionIds.filter(id => id != null))];
        const optionsCreate = await Promise.all(uniqueOptionIds.map(async (id) => {
          const option = line.form_line_options?.find(opt => opt.tag_option_id === id);
          let optionValue = option?.option_value;
          if (!optionValue) {
            const tagOption = line.tag_id ? await this.prisma.client.tag_options.findUnique({ where: { id: toBigInt(id) } }) : null;
            optionValue = tagOption?.option_value || undefined;
          }
          return { tag_option_id: toBigInt(id), option_value: optionValue };
        }));
        let iconValue = line.icon;
        if (!iconValue && tagId) {
          const tag = await this.prisma.client.tags.findUnique({
            where: { id: tagId },
            select: { icon: true }
          });
          iconValue = tag?.icon || undefined;
        }

        return {
          label: line.label ?? '',
          type: line.type ?? 'text',
          icon: iconValue ?? undefined,
          positionv: typeof line.positionv === 'number' ? line.positionv : Number(line.positionv) || 0,
          positionh: typeof line.positionh === 'number' ? line.positionh : Number(line.positionh) || 0,
          required: !!line.required,
          ...(tagId ? { tags: { connect: { id: tagId } } } : {}),
          ...(optionsCreate.length ? { form_line_options: { create: optionsCreate } } : {})
        } as any;
      }));
      const createdForm = await this.prisma.client.$transaction(async (tx) => {
        const f = await tx.form.create({ data: { ...formData, ...(linesToCreate.length ? { form_lines: { create: linesToCreate } } : {}) } });
        await this.logService.createLogForUserAction(user && user.id ? Number(user.id) : 1, 'form', Number(f.id), 'create', 'Form created');
        return f;
      });
      return createdForm;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error creating form: ' + (error?.message ?? 'Unknown error'));
    }
  }
  async findAll(user: any) {
    try {
      const formWhere: any = {};
      const categoryWhere: any = {};
      if (user.company_id) {
        formWhere.company_id = user.company_id;
        categoryWhere.company_id = user.company_id;
      }
      const [forms, allCompanies, allCategories] = await Promise.all([
        this.prisma.client.form.findMany({ where: formWhere }),
        this.prisma.client.companies.findMany({ select: { id: true, title: true } }),
        this.prisma.client.categories.findMany({ where: categoryWhere, select: { id: true, title: true } })
      ]);
      if (forms.length === 0) { return []; }
      const companyMap = new Map(allCompanies.map((c) => [c.id, c.title]));
      const categoryMap = new Map(allCategories.map((c) => [c.id, c.title]));
      const formIds = forms.map((form) => form.id);
      const logs = await this.prisma.client.logs.findMany({ where: { entity: 'form', row_id: { in: formIds }, action: { in: ['create', 'update'] } }, orderBy: { created_at: 'desc' } });
      const logsMap = new Map<bigint, { created_at?: Date, updated_at?: Date }>();
      for (const log of logs) {
        if (log.row_id === null || !log.created_at) continue;
        const entry = logsMap.get(log.row_id) || {};
        if (log.action === 'create' && !entry.created_at) { entry.created_at = log.created_at; } else if (log.action === 'update' && !entry.updated_at) { entry.updated_at = log.created_at; }
        logsMap.set(log.row_id, entry);
      }
      return forms.map((form) => ({
        ...form,
        company_title: form.company_id ? companyMap.get(form.company_id) : undefined,
        category_title: form.category_id ? categoryMap.get(form.category_id) : undefined,
        created_at: logsMap.get(form.id)?.created_at,
        updated_at: logsMap.get(form.id)?.updated_at,
      }));
    } catch (error) { throw new BadRequestException('Failed to fetch forms', error.message); }
  }
  async findOne(id: number, user: any) {
    try {
      const where: any = { id };
      if (user.company_id) { where.company_id = user.company_id; }
      const form = await this.prisma.client.form.findFirst({ where });
      if (!form) { throw new BadRequestException('Form not found or user does not have access.'); }
      const formLines = await this.prisma.client.form_lines.findMany({ where: { form_id: form.id }, include: { form_line_options: true, tags: { select: { icon: true } } }, orderBy: [{ positionv: 'asc' }, { positionh: 'asc' }] });
      
      const mappedFormLines = formLines.map(line => ({
        ...line,
        icon: line.icon || (line.tags?.icon) || undefined
      }));

      return { ...form, form_lines: mappedFormLines.map(({ tags, ...rest }) => rest) };
    } catch (error) { throw new BadRequestException('Failed to fetch form', error.message); }
  }
  async update(id: number, updateFormsDto: UpdateFormsDto, user: any) {
    const { form_lines, ...formData } = updateFormsDto;
    const where: any = { id: BigInt(id) };
    if (user.company_id) { where.company_id = BigInt(user.company_id); }
    const toBigInt = (v: any) => {
      if (v === undefined || v === null) return undefined;
      try { return BigInt(v); } catch { return undefined; }
    };
    return this.prisma.client.$transaction(async (prisma) => {
      const existingForm = await prisma.form.findFirst({ where, include: { form_lines: true } });
      if (!existingForm) { throw new BadRequestException('Form not found or user does not have access.'); }
      const formUpdateData: any = { ...formData };
      if (formUpdateData.company_id) formUpdateData.company_id = toBigInt(formUpdateData.company_id);
      if (formUpdateData.category_id) formUpdateData.category_id = toBigInt(formUpdateData.category_id);
      const updatedForm = await prisma.form.update({ where: { id: BigInt(id) }, data: formUpdateData });
      if (form_lines) {
        const existingLineIds = existingForm.form_lines.map((line) => line.id);
        const incomingLineIds = form_lines.map((line) => toBigInt(line.id)).filter((id) => id !== undefined);
        const linesToDelete = existingLineIds.filter((lineId) => !incomingLineIds.includes(lineId));
        if (linesToDelete.length > 0) { await prisma.form_lines.deleteMany({ where: { id: { in: linesToDelete } } }); }
        for (const line of form_lines) {
          let iconValue = line.icon;
          if (!iconValue && line.tag_id) {
            const tagId = toBigInt(line.tag_id);
            const tag = await this.prisma.client.tags.findUnique({
              where: { id: tagId },
              select: { icon: true }
            });
            iconValue = tag?.icon || undefined;
          }

          const lineData: any = {
            label: line.label ?? '',
            type: line.type ?? 'text',
            icon: iconValue ?? undefined,
            positionv: typeof line.positionv === 'number' ? line.positionv : Number(line.positionv) || 0,
            positionh: typeof line.positionh === 'number' ? line.positionh : Number(line.positionh) || 0,
            required: !!line.required,
            form: { connect: { id: BigInt(id) } },
          };
          if (line.tag_id) { lineData.tags = { connect: { id: toBigInt(line.tag_id) } }; } else { lineData.tags = { disconnect: true }; }
          const optionIds = (line.form_line_options || []).map(o => o.tag_option_id);
          const uniqueOptionIds = [...new Set(optionIds.filter(id => id != null))];
          const optionsToCreate = await Promise.all(uniqueOptionIds.map(async id => {
            const option = line.form_line_options?.find(opt => opt.tag_option_id === id);
            let optionValue = option?.option_value;
            if (!optionValue) {
              const tagOption = line.tag_id ? await this.prisma.client.tag_options.findUnique({ where: { id: toBigInt(id) } }) : null;
              optionValue = tagOption?.option_value || undefined;
            }
            return { tag_option_id: toBigInt(id), option_value: optionValue };
          }));
          if (line.id) { await prisma.form_lines.update({ where: { id: toBigInt(line.id) }, data: { ...lineData, form_line_options: { deleteMany: {}, create: optionsToCreate } } }); }
          else { await prisma.form_lines.create({ data: { ...lineData, form_line_options: { create: optionsToCreate } } }); }
        }
      }
      await this.logService.createLogForUserAction(user.id ? Number(user.id) : 1, 'form', Number(updatedForm.id), 'update', 'Form updated');
      return updatedForm;
    });
  }
  async remove(id: number, user: any) {
    try {
      const where: any = { id };
      if (user.company_id) { where.company_id = user.company_id; }
      const existingForm = await this.prisma.client.form.findFirst({ where });
      if (!existingForm) { throw new BadRequestException('Form not found or user does not have access.'); }
      const form = await this.prisma.client.form.delete({ where: { id } });
      await this.logService.createLogForUserAction(user.id ? Number(user.id) : 1, 'form', Number(form.id), 'delete', 'Form deleted');
      return form;
    } catch (error) { throw new BadRequestException('Failed to delete form', error.message); }
  }
}