import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateItemOccupationDto } from './dto/create-item-occupation.dto';
import { UpdateItemOccupationDto } from './dto/update-item-occupation.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class ItemOccupationService {
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

  async create(createItemOccupationDto: CreateItemOccupationDto, user: any) {
    try {
      const item = await this.prisma.client.items.findUnique({ where: { id: createItemOccupationDto.item_id } });
      if (!item) { throw new BadRequestException('Item not found'); }
      if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(item.company_id)) { throw new UnauthorizedException('You are not authorized to create occupations for this item.'); }
      const itemOccupation = await this.prisma.client.item_occupation.create({ data: createItemOccupationDto });
      const safeOccupation = this.convertBigIntToNumber(itemOccupation);
      await this.logService.createLogForUserAction(Number(user.id), 'item_occupation', Number(itemOccupation.id), 'create', `Item occupation created: ${JSON.stringify(safeOccupation)}`);
      return { message: 'Item occupation created successfully', itemOccupation: safeOccupation };
    } catch (error) { throw new BadRequestException(error.message || 'Error creating item occupation'); }
  }

  async findAll(user: any) {
    const where: any = {};
    if (Number(user.role_id) !== 1) { where.items = { company_id: user.company_id }; }

    const occupations = await this.prisma.client.item_occupation.findMany({
      where,
      include: {
        items: true,
        event_lines: {
          include: {
            events: true
          }
        }
      }
    });

    const processedOccupations = occupations.map((occupation: any) => {
      let processedStartDate = occupation.start_date;
      if (occupation.start_date && typeof occupation.start_date === 'object') {
        processedStartDate = new Date(occupation.start_date).toISOString();
      } else if (typeof occupation.start_date === 'string' && (occupation.start_date as string).trim().startsWith('(') && (occupation.start_date as string).trim().endsWith(')')) {
        const timestamp = (occupation.start_date as string).trim().slice(1, -1);
        processedStartDate = new Date(timestamp).toISOString();
      }

      let processedEndDate = occupation.end_date;
      if (occupation.end_date && typeof occupation.end_date === 'object') {
        processedEndDate = new Date(occupation.end_date).toISOString();
      } else if (typeof occupation.end_date === 'string' && (occupation.end_date as string).trim().startsWith('(') && (occupation.end_date as string).trim().endsWith(')')) {
        const timestamp = (occupation.end_date as string).trim().slice(1, -1);
        processedEndDate = new Date(timestamp).toISOString();
      }

      let processedEventLines = occupation.event_lines;
      if (occupation.event_lines) {
        processedEventLines = {
          ...occupation.event_lines,
          start_date: occupation.event_lines.start_date ? (typeof occupation.event_lines.start_date === 'object' ? new Date(occupation.event_lines.start_date).toISOString() : occupation.event_lines.start_date) : null,
          end_date: occupation.event_lines.end_date ? (typeof occupation.event_lines.end_date === 'object' ? new Date(occupation.event_lines.end_date).toISOString() : occupation.event_lines.end_date) : null
        };

        if (occupation.event_lines.events) {
          processedEventLines.events = {
            ...occupation.event_lines.events,
            start_date: occupation.event_lines.events.start_date ? (typeof occupation.event_lines.events.start_date === 'object' ? new Date(occupation.event_lines.events.start_date).toISOString() : occupation.event_lines.events.start_date) : null,
            end_date: occupation.event_lines.events.end_date ? (typeof occupation.event_lines.events.end_date === 'object' ? new Date(occupation.event_lines.events.end_date).toISOString() : occupation.event_lines.events.end_date) : null
          };
        }
      }

      return {
        ...occupation,
        start_date: processedStartDate,
        end_date: processedEndDate,
        event_lines: processedEventLines
      };
    });

    return this.convertBigIntToNumber(processedOccupations);
  }

  async getItemAvailability(itemId: number, user: any) {
    const item = await this.prisma.client.items.findUnique({ where: { id: itemId } });
    if (!item) { throw new BadRequestException('Item not found'); }
    if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(item.company_id)) { throw new UnauthorizedException('You are not authorized to view availability for this item.'); }
    const occupations = await this.prisma.client.item_occupation.findMany({ where: { item_id: itemId }, include: { event_lines: { include: { events: true } } }, orderBy: { start_date: 'asc' } });

    const processedOccupations = occupations.map((occupation: any) => {
      let processedStartDate = occupation.start_date;
      if (occupation.start_date && typeof occupation.start_date === 'object') {
        processedStartDate = new Date(occupation.start_date).toISOString();
      } else if (typeof occupation.start_date === 'string' && (occupation.start_date as string).trim().startsWith('(') && (occupation.start_date as string).trim().endsWith(')')) {
        const timestamp = (occupation.start_date as string).trim().slice(1, -1);
        processedStartDate = new Date(timestamp).toISOString();
      }

      let processedEndDate = occupation.end_date;
      if (occupation.end_date && typeof occupation.end_date === 'object') {
        processedEndDate = new Date(occupation.end_date).toISOString();
      } else if (typeof occupation.end_date === 'string' && (occupation.end_date as string).trim().startsWith('(') && (occupation.end_date as string).trim().endsWith(')')) {
        const timestamp = (occupation.end_date as string).trim().slice(1, -1);
        processedEndDate = new Date(timestamp).toISOString();
      }

      let processedEventLines = occupation.event_lines;
      if (occupation.event_lines) {
        processedEventLines = {
          ...occupation.event_lines,
          start_date: occupation.event_lines.start_date ? (typeof occupation.event_lines.start_date === 'object' ? new Date(occupation.event_lines.start_date).toISOString() : occupation.event_lines.start_date) : null,
          end_date: occupation.event_lines.end_date ? (typeof occupation.event_lines.end_date === 'object' ? new Date(occupation.event_lines.end_date).toISOString() : occupation.event_lines.end_date) : null
        };

        if (occupation.event_lines.events) {
          processedEventLines.events = {
            ...occupation.event_lines.events,
            start_date: occupation.event_lines.events.start_date ? (typeof occupation.event_lines.events.start_date === 'object' ? new Date(occupation.event_lines.events.start_date).toISOString() : occupation.event_lines.events.start_date) : null,
            end_date: occupation.event_lines.events.end_date ? (typeof occupation.event_lines.events.end_date === 'object' ? new Date(occupation.event_lines.events.end_date).toISOString() : occupation.event_lines.events.end_date) : null
          };
        }
      }

      return {
        ...occupation,
        start_date: processedStartDate,
        end_date: processedEndDate,
        event_lines: processedEventLines
      };
    });

    return this.convertBigIntToNumber(processedOccupations);
  }

  async findOne(id: number, user: any) {
    const itemOccupation = await this.prisma.client.item_occupation.findUnique({
      where: { id },
      include: {
        items: true,
        event_lines: {
          include: {
            events: true
          }
        }
      }
    });
    if (!itemOccupation) { throw new BadRequestException('Item occupation not found'); }
    if (!itemOccupation.items) { throw new BadRequestException('Item for this occupation not found'); }
    if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(itemOccupation.items.company_id)) { throw new UnauthorizedException('You are not authorized to view this item occupation.'); }

    let processedStartDate: any = itemOccupation.start_date;
    if (itemOccupation.start_date && typeof itemOccupation.start_date === 'object') {
      processedStartDate = new Date(itemOccupation.start_date).toISOString();
    } else if (typeof itemOccupation.start_date === 'string' && (itemOccupation.start_date as string).trim().startsWith('(') && (itemOccupation.start_date as string).trim().endsWith(')')) {
      const timestamp = (itemOccupation.start_date as string).trim().slice(1, -1);
      processedStartDate = new Date(timestamp).toISOString();
    }

    let processedEndDate: any = itemOccupation.end_date;
    if (itemOccupation.end_date && typeof itemOccupation.end_date === 'object') {
      processedEndDate = new Date(itemOccupation.end_date).toISOString();
    } else if (typeof itemOccupation.end_date === 'string' && (itemOccupation.end_date as string).trim().startsWith('(') && (itemOccupation.end_date as string).trim().endsWith(')')) {
      const timestamp = (itemOccupation.end_date as string).trim().slice(1, -1);
      processedEndDate = new Date(timestamp).toISOString();
    }

    let processedEventLines: any = itemOccupation.event_lines;
    if (itemOccupation.event_lines) {
      processedEventLines = {
        ...itemOccupation.event_lines,
        start_date: itemOccupation.event_lines.start_date ? (typeof itemOccupation.event_lines.start_date === 'object' ? new Date(itemOccupation.event_lines.start_date).toISOString() : itemOccupation.event_lines.start_date) : null,
        end_date: itemOccupation.event_lines.end_date ? (typeof itemOccupation.event_lines.end_date === 'object' ? new Date(itemOccupation.event_lines.end_date).toISOString() : itemOccupation.event_lines.end_date) : null
      };

      if (itemOccupation.event_lines.events) {
        processedEventLines.events = {
          ...itemOccupation.event_lines.events,
          start_date: itemOccupation.event_lines.events.start_date ? (typeof itemOccupation.event_lines.events.start_date === 'object' ? new Date(itemOccupation.event_lines.events.start_date).toISOString() : itemOccupation.event_lines.events.start_date) : null,
          end_date: itemOccupation.event_lines.events.end_date ? (typeof itemOccupation.event_lines.events.end_date === 'object' ? new Date(itemOccupation.event_lines.events.end_date).toISOString() : itemOccupation.event_lines.events.end_date) : null
        };
      }
    }

    const processedOccupation = {
      ...itemOccupation,
      start_date: processedStartDate,
      end_date: processedEndDate,
      event_lines: processedEventLines
    };

    return this.convertBigIntToNumber(processedOccupation);
  }

  async update(id: number, updateItemOccupationDto: UpdateItemOccupationDto, user: any) {
    try {
      const occupationToUpdate = await this.prisma.client.item_occupation.findUnique({ where: { id }, include: { items: true } });
      if (!occupationToUpdate) { throw new BadRequestException('Item occupation not found'); }
      if (!occupationToUpdate.items) { throw new BadRequestException('Item for this occupation not found'); }
      if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(occupationToUpdate.items.company_id)) { throw new UnauthorizedException('You are not authorized to update this item occupation.'); }
      const itemOccupation = await this.prisma.client.item_occupation.update({ where: { id }, data: { item_id: updateItemOccupationDto.itemId, event_line_id: updateItemOccupationDto.eventLineId, start_date: updateItemOccupationDto.startDate, end_date: updateItemOccupationDto.endDate, status: updateItemOccupationDto.status } });
      const safeOccupation = this.convertBigIntToNumber(itemOccupation);
      await this.logService.createLogForUserAction(Number(user.id), 'item_occupation', Number(itemOccupation.id), 'update', `Item occupation updated: ${JSON.stringify(safeOccupation)}`);
      return { message: 'Item occupation updated successfully', itemOccupation: safeOccupation };
    } catch (error) { throw new BadRequestException(error.message || 'Error updating item occupation'); }
  }

  async remove(id: number, user: any) {
    try {
      const occupationToDelete = await this.prisma.client.item_occupation.findUnique({ where: { id }, include: { items: true } });
      if (!occupationToDelete) { throw new BadRequestException('Item occupation not found'); }
      if (!occupationToDelete.items) { throw new BadRequestException('Item for this occupation not found'); }
      if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(occupationToDelete.items.company_id)) { throw new UnauthorizedException('You are not authorized to delete this item occupation.'); }
      const itemOccupation = await this.prisma.client.item_occupation.delete({ where: { id } });
      const safeOccupation = this.convertBigIntToNumber(itemOccupation);
      await this.logService.createLogForUserAction(Number(user.id), 'item_occupation', Number(itemOccupation.id), 'delete', `Item occupation deleted: ${JSON.stringify(safeOccupation)}`);
      return { message: 'Item occupation deleted successfully', itemOccupation: safeOccupation };
    } catch (error) { throw new BadRequestException(error.message || 'Error deleting item occupation'); }
  }
}