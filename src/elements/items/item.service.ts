import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateItemMediaDto } from '../item-media/dto/create-item-media.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService, private logService: LogService) { }

  private convertBigIntToNumber(obj: any): any {
    if (obj === null || obj === undefined) { return obj; }
    if (typeof obj === 'bigint') { return Number(obj); }
    if (Array.isArray(obj)) { return obj.map(item => this.convertBigIntToNumber(item)); }
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) { result[key] = this.convertBigIntToNumber(obj[key]); }
      return result;
    }
    return obj;
  }
  async create(createItemDto: CreateItemDto, user: any) {
    try {
      if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(createItemDto.company_id)) { throw new UnauthorizedException('You are not authorized to create items for this company.'); }
      let defaultStatus = 0;
      if (Number(user.role_id) === 1 || Number(user.role_id) === 2) { defaultStatus = createItemDto.status || 0; }
      const itemData: any = {
        title: createItemDto.title,
        description: createItemDto.description,
        price: createItemDto.price,
        provider_id: createItemDto.provider_id ? Number(createItemDto.provider_id) : null,
        company_id: createItemDto.company_id ? Number(createItemDto.company_id) : null,
        status: defaultStatus,
        image: createItemDto.image,
        cover: createItemDto.cover,
        code: createItemDto.code,
      };
      if (createItemDto.item_category && createItemDto.item_category.length > 0) { itemData.item_category = { create: createItemDto.item_category.map(cat => ({ category_id: Number(cat.category_id) })) }; }
      const item = await this.prisma.client.items.create({ data: itemData, include: { item_category: true, item_media: true, item_occupation: true } });
      const itemCode = 'C' + item.company_id + 'P' + item.provider_id + 'I' + item.id;
      const updateItem = await this.prisma.client.items.update({ where: { id: item.id }, data: { code: itemCode } });
      if (createItemDto.form_values && Object.keys(createItemDto.form_values).length > 0) {
        let formId: number | undefined;
        if (createItemDto.form_item && createItemDto.form_item.length > 0) { formId = Number(createItemDto.form_item[0]?.form_id); }
        await this.processFormValues(Number(item.id), createItemDto.form_values, formId ? Number(formId) : undefined);
      }
      const safeItem = this.convertBigIntToNumber(updateItem);
      await this.logService.createLogForUserAction(Number(user.id), 'items', Number(item.id), 'create', `Item created: ${safeItem.title}, ID: ${safeItem.id}`);
      await this.sendNotifications(safeItem, user);
      return { message: 'Item created successfully', item: safeItem };
    } catch (error) { throw new BadRequestException(error.message || 'Error creating item'); }
  }
  async findAll(user: any) {
    const where: any = {};
    if (Number(user.role_id) !== 1) {
      if (Number(user.role_id) === 2) { where.company_id = user.company_id; }
      if (Number(user.role_id) === 3) { where.provider_id = user.id; }
      if (Number(user.role_id) === 4) {
        const interactions = await this.prisma.client.new_interactions.findMany({ where: { user_id: user.id } })
        const itemIds = Array.from(new Set(interactions.map(i => Number(i.target_id))));
        where.id = { in: itemIds };
      }
    }
    const items = await this.prisma.client.items.findMany({ where, include: { item_category: true, item_media: true, item_occupation: true, users: true, item_sections: { include: { item_section_options: true, formLines: true } } }, orderBy: { id: 'desc' } });
    const itemsWithLogs = await Promise.all(
      items.map(async (item) => {
        const createLog = await this.prisma.client.logs.findFirst({ where: { entity: 'items', row_id: item.id, action: 'create' }, orderBy: { created_at: 'asc' } });
        const updateLog = await this.prisma.client.logs.findFirst({ where: { entity: 'items', row_id: item.id, action: 'update' }, orderBy: { created_at: 'desc' } });
        const createdAt = createLog?.created_at ? new Date(createLog.created_at).toISOString() : null;
        const updatedAt = updateLog?.created_at ? new Date(updateLog.created_at).toISOString() : null;
        const result = { ...item, created_at: createdAt, updated_at: updatedAt };
        return this.convertBigIntToNumber(result);
      }),
    );
    return itemsWithLogs;
  }
  async findOne(id: number, user: any) {
    const item = await this.prisma.client.items.findUnique({ where: { id }, include: { item_category: true, item_media: true, item_occupation: true, users: true, item_sections: { include: { item_section_options: true, formLines: true } } } });
    if (!item) { throw new BadRequestException('Item not found'); }
    if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(item.company_id)) { throw new UnauthorizedException('You are not authorized to view this item.'); }
    const formValues: Record<string, any> = {};
    if (item.item_sections && item.item_sections.length > 0) {
      for (const section of item.item_sections) {
        if (section.form_linesId) {
          const options = section.item_section_options || [];
          if (options.length > 0) {
            if (options.length === 1) {
              let optionValue = options[0].option_value || options[0].selected;
              try {
                const stringValue = typeof optionValue === 'string' ? optionValue : String(optionValue);
                if (stringValue.includes('min:') && stringValue.includes('max:')) {
                  const parts = stringValue.split(',');
                  const minPart = parts.find(p => p.startsWith('min:'));
                  const maxPart = parts.find(p => p.startsWith('max:'));
                  if (minPart && maxPart) {
                    const min = minPart.split(':')[1];
                    const max = maxPart.split(':')[1];
                    formValues[`${section.form_linesId.toString()}_min`] = min;
                    formValues[`${section.form_linesId.toString()}_max`] = max;
                  } else { formValues[section.form_linesId.toString()] = optionValue; }
                } else {
                  const parsedValue = JSON.parse(stringValue);
                  if (Array.isArray(parsedValue) && parsedValue.length === 2) {
                    formValues[`${section.form_linesId.toString()}_min`] = parsedValue[0];
                    formValues[`${section.form_linesId.toString()}_max`] = parsedValue[1];
                  } else { formValues[section.form_linesId.toString()] = optionValue; }
                }
              } catch (e) { formValues[section.form_linesId.toString()] = optionValue; }
            } else { formValues[section.form_linesId.toString()] = options.map(opt => opt.option_value || opt.selected); }
          } else { formValues[section.form_linesId.toString()] = section.label || ''; }
        } else { }
      }
    }
    const createLog = await this.prisma.client.logs.findFirst({ where: { entity: 'items', row_id: item.id, action: 'create' }, orderBy: { created_at: 'asc' } });
    const updateLog = await this.prisma.client.logs.findFirst({ where: { entity: 'items', row_id: item.id, action: 'update' }, orderBy: { created_at: 'desc' } });
    const createdAt = createLog?.created_at ? new Date(createLog.created_at).toISOString() : null;
    const updatedAt = updateLog?.created_at ? new Date(updateLog.created_at).toISOString() : null;
    const result = { ...item, created_at: createdAt, updated_at: updatedAt, form_values: formValues, form_id: item.item_sections && item.item_sections.length > 0 && item.item_sections[0].formLines ? Number(item.item_sections[0].formLines.form_id) : undefined };
    return this.convertBigIntToNumber(result);
  }
  async update(id: number, updateItemDto: UpdateItemDto, user: any) {
    try {
      const itemToUpdate = await this.prisma.client.items.findUnique({ where: { id } });
      if (!itemToUpdate) { throw new BadRequestException('Item not found'); }
      if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(itemToUpdate.company_id)) { throw new UnauthorizedException('You are not authorized to update this item.'); }
      const { title, description, price, provider_id, status, image, cover, code, item_category, form_item, form_values } = updateItemDto;
      let updateData: any = { title, description, price, provider_id: provider_id ? Number(provider_id) : undefined, image, cover, code };
      const userRoleId = Number(user.role_id);
      if (userRoleId === 1 || userRoleId === 2) { updateData.status = status !== undefined ? status : itemToUpdate.status; } else { updateData.status = itemToUpdate.status; }
      const item = await this.prisma.client.items.update({ where: { id }, data: updateData, include: { item_category: true, item_media: true, item_occupation: true, users: true, item_sections: { include: { item_section_options: true, formLines: true } } } });
      if (item_category && item_category.length > 0) {
        await this.prisma.client.item_category.deleteMany({ where: { item_id: id } });
        await this.prisma.client.item_category.createMany({ data: item_category.map(cat => ({ item_id: id, category_id: Number(cat.category_id) })) });
      }
      if (form_values && Object.keys(form_values).length > 0 && form_item && form_item.length > 0) {
        const formId = Number(form_item[0].form_id);
        await this.prisma.client.item_section_options.deleteMany({ where: { item_section: { item_id: id } } });
        await this.prisma.client.item_sections.deleteMany({ where: { item_id: id } });
        await this.processFormValues(id, form_values, formId);
      }
      const safeItem = this.convertBigIntToNumber(item);
      await this.logService.createLogForUserAction(Number(user.id), 'items', Number(item.id), 'update', `Item ${item.title} (ID: ${item.id}) has been updated.`);
      return { message: 'Item updated successfully', item: safeItem };
    } catch (error) { throw new BadRequestException(error.message || 'Error updating item'); }
  }
  async remove(id: number, user: any) {
    try {
      const itemToDelete = await this.prisma.client.items.findUnique({ where: { id } });
      if (!itemToDelete) { throw new BadRequestException('Item not found'); }
      if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(itemToDelete.company_id)) { throw new UnauthorizedException('You are not authorized to delete this item.'); }
      const item = await this.prisma.client.items.delete({ where: { id } });
      const safeItem = this.convertBigIntToNumber(item);
      await this.logService.createLogForUserAction(Number(user.id), 'items', Number(item.id), 'delete', `Item ${item.title} (ID: ${item.id}) has been deleted.`);
      return { message: 'Item deleted successfully', item: safeItem };
    } catch (error) { throw new BadRequestException(error.message || 'Error deleting item'); }
  }
  private async processFormValues(itemId: number, formValues: Record<string, any>, formId?: number | bigint) {
    if (!formId) { return; }
    try {
      const form = await this.prisma.client.form.findUnique({ where: { id: Number(formId) }, include: { form_lines: { include: { tags: true, form_line_options: { include: { tagOptions: true } } } } } });
      if (!form || !form.form_lines) { return; }

      for (const formLine of form.form_lines) {
        const formLineIdStr = formLine.id.toString();
        // Try to get value by ID (primary) or Title (fallback)
        let fieldValue = formValues[formLineIdStr];
        if (fieldValue === undefined && formLine.tags?.title) {
          fieldValue = formValues[formLine.tags.title];
        }

        const itemSection = await this.prisma.client.item_sections.create({
          data: {
            item_id: itemId,
            icon: formLine.icon || (formLine.tags?.icon) || 'circle-dot',
            label: formLine.label || formLine.tags?.title || 'Section',
            type: formLine.type || '',
            positionv: formLine.positionv || 0,
            positionh: formLine.positionh || 0,
            tagsId: formLine.tag_id || undefined,
            form_linesId: formLine.id
          }
        });

        // Handle Range
        const minKey = `${formLineIdStr}_min`;
        const maxKey = `${formLineIdStr}_max`;
        let rangeValue: string | null = null;

        if (formValues[minKey] !== undefined && formValues[maxKey] !== undefined) {
          const minValue = formValues[minKey];
          const maxValue = formValues[maxKey];
          let rangeConfig = 'step:1,type:number';
          const formLineWithOptions = form.form_lines?.find(fl => fl.id === formLine.id);
          if (formLineWithOptions?.form_line_options && formLineWithOptions.form_line_options.length > 0) {
            const firstOption = formLineWithOptions.form_line_options[0];
            const optionValue = firstOption.option_value || firstOption.tagOptions?.option_value;
            if (optionValue && optionValue.includes('min:') && optionValue.includes('max:')) {
              const parts = optionValue.split(',');
              const stepPart = parts.find(p => p.startsWith('step:')) || 'step:1';
              const typePart = parts.find(p => p.startsWith('type:')) || 'type:number';
              const unitPart = parts.find(p => p.startsWith('unit:'));
              rangeConfig = `${stepPart},${typePart}${unitPart ? `,${unitPart}` : ''}`;
            }
          }
          rangeValue = `min:${minValue},max:${maxValue},${rangeConfig}`;
        } else if (typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue) && fieldValue.min !== undefined && fieldValue.max !== undefined) {
          const minValue = fieldValue.min;
          const maxValue = fieldValue.max;
          let rangeConfig = 'step:1,type:number';
          const formLineWithOptions = form.form_lines?.find(fl => fl.id === formLine.id);
          if (formLineWithOptions?.form_line_options && formLineWithOptions.form_line_options.length > 0) {
            const firstOption = formLineWithOptions.form_line_options[0];
            const optionValue = firstOption.option_value || firstOption.tagOptions?.option_value;
            if (optionValue && optionValue.includes('min:') && optionValue.includes('max:')) {
              const parts = optionValue.split(',');
              const stepPart = parts.find(p => p.startsWith('step:')) || 'step:1';
              const typePart = parts.find(p => p.startsWith('type:')) || 'type:number';
              const unitPart = parts.find(p => p.startsWith('unit:')) || 'unit:unit';
              rangeConfig = `${stepPart},${typePart}${unitPart ? `,${unitPart}` : ''}`;
            }
          }
          rangeValue = `min:${minValue},max:${maxValue},${rangeConfig}`;
        }

        if (rangeValue) {
          await this.prisma.client.item_section_options.create({
            data: {
              item_section_id: itemSection.id,
              form_line_id: formLine.id,
              option_value: rangeValue,
              selected: true,
              tag_option_id: undefined,
              form_line_optionsId: undefined
            }
          });
          continue; // Done for range
        }

        // Handle Options (Checkbox, Select, Radio)
        let optionsProcessed = false;

        // 1. Form Line Options (Primary source)
        if (formLine.form_line_options && formLine.form_line_options.length > 0) {
          optionsProcessed = true;
          for (const opt of formLine.form_line_options) {
            let isSelected = false;
            const optValue = opt.option_value || opt.tagOptions?.option_value || '';

            if (Array.isArray(fieldValue)) {
              isSelected = fieldValue.some(v => String(v) === String(optValue));
            } else if (fieldValue !== undefined && fieldValue !== null) {
              isSelected = String(fieldValue) === String(optValue);
            }

            await this.prisma.client.item_section_options.create({
              data: {
                item_section_id: itemSection.id,
                form_line_id: formLine.id,
                option_value: optValue,
                selected: isSelected,
                form_line_optionsId: opt.id,
                tag_option_id: opt.tag_option_id || undefined
              }
            });
          }
        }
        // 2. Tag Options (Fallback if no form_line_options but tag_id exists)
        else if (formLine.tag_id) {
          const tagOptions = await this.prisma.client.tag_options.findMany({ where: { tag_id: formLine.tag_id } });
          if (tagOptions.length > 0) {
            optionsProcessed = true;
            for (const opt of tagOptions) {
              let isSelected = false;
              if (Array.isArray(fieldValue)) {
                isSelected = fieldValue.some(v => String(v) === String(opt.option_value));
              } else if (fieldValue !== undefined && fieldValue !== null) {
                isSelected = String(fieldValue) === String(opt.option_value);
              }

              await this.prisma.client.item_section_options.create({
                data: {
                  item_section_id: itemSection.id,
                  form_line_id: formLine.id,
                  option_value: opt.option_value,
                  selected: isSelected,
                  tag_option_id: opt.id
                }
              });
            }
          }
        }

        // 3. Free Input (Text, Number, etc. - if no options processed)
        if (!optionsProcessed && fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          await this.prisma.client.item_section_options.create({
            data: {
              item_section_id: itemSection.id,
              form_line_id: formLine.id,
              option_value: String(fieldValue),
              selected: true
            }
          });
        }
      }
    } catch (error) { throw new BadRequestException('Error processing form values: ' + error.message); }
  }
  async addMediaToItem(itemId: number, createItemMediaDto: CreateItemMediaDto, user: any) {
    try {
      const item = await this.prisma.client.items.findUnique({ where: { id: itemId } });
      if (!item) { throw new BadRequestException('Item not found'); }
      if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(item.company_id)) { throw new UnauthorizedException('You are not authorized to add media to this item.'); }
      const itemMediaData: any = { ...createItemMediaDto, item_id: itemId };
      if (createItemMediaDto.company_id) { itemMediaData.company_id = createItemMediaDto.company_id; } else { itemMediaData.company_id = item.company_id; }
      const itemMedia = await this.prisma.client.item_media.create({ data: itemMediaData });
      await this.logService.createLogForUserAction(Number(user.id), 'item_media', Number(itemMedia.id), 'create', `Media added to item ${itemId}: ${itemMedia.file}`);
      return { message: 'Media added to item successfully', itemMedia };
    } catch (error) { throw new BadRequestException(error.message || 'Error adding media to item'); }
  }
  private async sendNotifications(item: any, user: any) {
    try {
      const adminUsers = await this.prisma.client.users.findMany({ where: { role_id: { in: [1, 2] } } });
      for (const adminUser of adminUsers) { await this.prisma.client.notifications.create({ data: { actor_id: user.id, receiver_id: adminUser.id, notification: `New item "${item.title}" created by ${user.username || 'a provider'}.`, status: 0 } }); }
      await this.logService.createLogForUserAction(Number(user.id), 'notifications', item.id, 'create', `Notifications sent for new item: ${item.title}`);
    } catch (error) { throw new BadRequestException('Error sending notifications: ' + error.message); }
  }
}