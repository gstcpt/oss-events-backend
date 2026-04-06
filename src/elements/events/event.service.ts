import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { LogService } from '../../common/services/log.service';
import { NotificationService } from '../../common/services/notification.service';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService, private logService: LogService, private notificationService: NotificationService) { }
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
  async create(createEventDto: CreateEventDto, user: any) {
    try {
      if (Number(user.role_id) !== 1 && Number(user.company_id) !== createEventDto.companyId) { throw new UnauthorizedException('You are not authorized to create events for this company.'); }
      const event = await this.prisma.client.events.create({ data: createEventDto, include: { event_lines: true } });
      const safeEvent = this.convertBigIntToNumber(event);
      await this.logService.createLogForUserAction(Number(user.id), 'events', Number(event.id), 'create', `Event created: ${JSON.stringify(safeEvent)}`);
      const client = await this.prisma.client.users.findUnique({ where: { id: Number(event.client_id) } });
      const event_lines = await this.prisma.client.event_lines.findMany({ where: { event_id: Number(event.id) } });
      const items = await this.prisma.client.items.findMany({ where: { id: { in: event_lines.map(el => Number(el.item_id)) } } });
      if (client) {
        for (const item of items) {
          await this.notificationService.createNotification(Number(client.id), Number(item.provider_id), `${client.firstname + ' ' + client.lastname} created an event and he/she did use your item ${item.title}.`);
        }
      }
      return { message: 'Event created successfully', event: safeEvent };
    } catch (error) { throw new BadRequestException(error.message || 'Error creating event'); }
  }
  async findAll(user: any) {
    try {
      const where: any = {};
      if (Number(user.role_id) === 2) { where.company_id = user.company_id; }
      if (Number(user.role_id) === 3) {
        const items = await this.prisma.client.items.findMany({ where: { provider_id: user.id, } })
        const itemIds = Array.from(new Set(items.map(i => Number(i.id))));
        const eventLines = await this.prisma.client.event_lines.findMany({ where: { item_id: { in: itemIds } } })
        const eventLinesEventsIds = Array.from(new Set(eventLines.map(i => Number(i.event_id))));
        where.id = { in: eventLinesEventsIds };
      }
      if (Number(user.role_id) === 4) { where.client_id = user.id; }
      const events = await this.prisma.client.events.findMany({ where, include: { event_lines: { include: { items: true, item_occupation: true } } }, orderBy: { id: 'desc' } });

      const eventsWithLogs = await Promise.all(
        events.map(async (event) => {
          try {
            const createLog = await this.prisma.client.logs.findFirst({ where: { entity: 'events', row_id: event.id, action: 'create' }, orderBy: { created_at: 'desc' } });
            const updateLog = await this.prisma.client.logs.findFirst({ where: { entity: 'events', row_id: event.id, action: 'update' }, orderBy: { created_at: 'desc' } });

            let minStartDate: string | null = null;
            let maxEndDate: string | null = null;
            let clientInfo = null;

            const processedEventLines = event.event_lines.map(line => {
              let processedStartDate: any = line.start_date;
              let processedEndDate: any = line.end_date;

              const parseDate = (d: any) => {
                if (!d) return null;
                if (d instanceof Date) return d;
                if (typeof d === 'string') {
                  const trimmed = d.trim();
                  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
                    return new Date(trimmed.slice(1, -1));
                  }
                  return new Date(d);
                }
                return null;
              };

              const start = parseDate(line.start_date);
              const end = parseDate(line.end_date);

              processedStartDate = start && !isNaN(start.getTime()) ? start.toISOString() : null;
              processedEndDate = end && !isNaN(end.getTime()) ? end.toISOString() : null;

              return { ...line, start_date: processedStartDate, end_date: processedEndDate };
            });

            if (processedEventLines && processedEventLines.length > 0) {
              const validStartTimestamps = processedEventLines
                .map(l => l.start_date ? new Date(l.start_date).getTime() : NaN)
                .filter(t => !isNaN(t));

              const validEndTimestamps = processedEventLines
                .map(l => l.end_date ? new Date(l.end_date).getTime() : NaN)
                .filter(t => !isNaN(t));

              if (validStartTimestamps.length > 0) {
                minStartDate = new Date(Math.min(...validStartTimestamps)).toISOString();
              }
              if (validEndTimestamps.length > 0) {
                maxEndDate = new Date(Math.max(...validEndTimestamps)).toISOString();
              }
            }

            if (event.client_id) {
              const client = await this.prisma.client.users.findUnique({ where: { id: event.client_id }, select: { id: true, firstname: true, lastname: true, phone: true, email: true } });
              clientInfo = client ? this.convertBigIntToNumber(client) : null;
            }
            const createdAt = createLog?.created_at ? new Date(createLog.created_at).toISOString() : null;
            const updatedAt = updateLog?.created_at ? new Date(updateLog.created_at).toISOString() : null;
            if (!minStartDate && event.start_date) minStartDate = new Date(event.start_date).toISOString();
            if (!maxEndDate && event.end_date) maxEndDate = new Date(event.end_date).toISOString();
            const result = { ...event, start_date: minStartDate, end_date: maxEndDate, created_at: createdAt, updated_at: updatedAt, client: clientInfo, event_lines: processedEventLines };
            return this.convertBigIntToNumber(result);
          } catch (innerError) {
            return this.convertBigIntToNumber(event);
          }
        }),
      );
      return eventsWithLogs;
    } catch (error) {
      throw new BadRequestException(error.message || 'Error fetching events');
    }
  }
  async findOne(id: number, user: any) {
    const event = await this.prisma.client.events.findUnique({ where: { id }, include: { event_lines: { include: { items: true, item_occupation: true } } } });
    if (!event) { throw new BadRequestException('Event not found'); }
    if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(event.company_id)) { throw new UnauthorizedException('You are not authorized to view this event.'); }
    const createLog = await this.prisma.client.logs.findFirst({ where: { entity: 'events', row_id: event.id, action: 'create' }, orderBy: { created_at: 'desc' } });
    const updateLog = await this.prisma.client.logs.findFirst({ where: { entity: 'events', row_id: event.id, action: 'update' }, orderBy: { created_at: 'desc' } });
    let minStartDate: string | null = null;
    let maxEndDate: string | null = null;
    if (event.event_lines && event.event_lines.length > 0) {
      const validStartDates = event.event_lines.map(line => line.start_date).filter((date: any) => {
        if (!date) return false;
        if (typeof date === 'object' && date !== null) return true;
        if (typeof date === 'string' && date.trim().startsWith('(') && date.trim().endsWith(')')) return true;
        return false;
      });
      const validEndDates = event.event_lines.map(line => line.end_date).filter((date: any) => {
        if (!date) return false;
        if (typeof date === 'object' && date !== null) return true;
        if (typeof date === 'string' && date.trim().startsWith('(') && date.trim().endsWith(')')) return true;
        return false;
      });
      if (validStartDates.length > 0) {
        const startTimestamps = validStartDates.map((d: any) => {
          if (typeof d === 'object') { return new Date(d).getTime(); }
          else if (typeof d === 'string') {
            const timestamp = d.trim().slice(1, -1);
            return new Date(timestamp).getTime();
          }
          return 0;
        });
        minStartDate = new Date(Math.min(...startTimestamps)).toISOString();
      }
      if (validEndDates.length > 0) {
        const endTimestamps = validEndDates.map((d: any) => {
          if (typeof d === 'object') { return new Date(d).getTime(); }
          else if (typeof d === 'string') {
            const timestamp = d.trim().slice(1, -1);
            return new Date(timestamp).getTime();
          }
          return 0;
        });
        maxEndDate = new Date(Math.max(...endTimestamps)).toISOString();
      }
    }
    let clientInfo = null;
    if (event.client_id) {
      const client = await this.prisma.client.users.findUnique({ where: { id: event.client_id }, select: { id: true, firstname: true, lastname: true, phone: true, email: true } });
      clientInfo = client ? this.convertBigIntToNumber(client) : null;
    }
    const createdAt = createLog?.created_at ? new Date(createLog.created_at).toISOString() : null;
    const updatedAt = updateLog?.created_at ? new Date(updateLog.created_at).toISOString() : null;
    return this.convertBigIntToNumber({ ...event, start_date: minStartDate, end_date: maxEndDate, created_at: createdAt, updated_at: updatedAt, client: clientInfo });
  }
  async update(id: number, updateEventDto: UpdateEventDto, user: any) {
    try {
      const eventToUpdate = await this.prisma.client.events.findUnique({ where: { id } });
      if (!eventToUpdate) { throw new BadRequestException('Event not found'); }
      const isSuperAdmin = Number(user.role_id) === 1;
      const isCompanyUser = Number(user.company_id) === Number(eventToUpdate.company_id);
      const isEventOwner = Number(user.id) === Number(eventToUpdate.client_id);
      if (!isSuperAdmin && !isCompanyUser && !isEventOwner) { throw new UnauthorizedException('You are not authorized to update this event.'); }
      const event = await this.prisma.client.events.update({ where: { id }, data: updateEventDto, include: { event_lines: true } });
      const safeEvent = this.convertBigIntToNumber(event);
      await this.logService.createLogForUserAction(Number(user.id), 'events', Number(event.id), 'update', `Event updated: ${JSON.stringify(safeEvent)}`);
      return { message: 'Event updated successfully', event: safeEvent };
    } catch (error) { throw new BadRequestException(error.message || 'Error updating event'); }
  }
  async remove(id: number, user: any) {
    try {
      const eventToDelete = await this.prisma.client.events.findUnique({ where: { id }, include: { event_lines: true } });
      if (!eventToDelete) { throw new BadRequestException('Event not found'); }
      const isSuperAdmin = Number(user.role_id) === 1;
      const isCompanyUser = Number(user.company_id) === Number(eventToDelete.company_id);
      const isEventOwner = Number(user.id) === Number(eventToDelete.client_id);
      if (!isSuperAdmin && !isCompanyUser && !isEventOwner) { throw new UnauthorizedException('You are not authorized to delete this event.'); }
      await this.prisma.client.$transaction(async (prisma) => {
        const eventLineIds = eventToDelete.event_lines.map(line => line.id);
        if (eventLineIds.length > 0) {
          await prisma.item_occupation.deleteMany({ where: { event_line_id: { in: eventLineIds } } });
          await this.logService.createLogForUserAction(Number(user.id), 'item_occupation', id, 'delete', `Item occupations deleted for event ${id}`);
        }
        await prisma.events.delete({ where: { id } });
      });
      const safeEvent = this.convertBigIntToNumber(eventToDelete);
      await this.logService.createLogForUserAction(Number(user.id), 'events', Number(id), 'delete', `Event deleted: ${JSON.stringify(safeEvent)}`);
      return { message: 'Event deleted successfully', event: safeEvent };
    } catch (error) { throw new BadRequestException(error.message || 'Error deleting event'); }
  }
  async getEventStatistics(eventId: number, user: any) {
    try {
      const event = await this.prisma.client.events.findUnique({ where: { id: eventId }, include: { event_lines: { include: { items: true, item_occupation: true } } } });
      if (!event) { throw new BadRequestException('Event not found'); }
      if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(event.company_id)) { throw new UnauthorizedException('You are not authorized to view this event.'); }
      const itemsUsed = event.event_lines.filter(line => line.item_id).length;
      const uniqueItemsUsed = new Set(event.event_lines.map(line => line.item_id).filter(id => id)).size;
      const itemsWithDetails = await Promise.all(
        event.event_lines.filter(line => line.item_id).map(async line => {
          const item = await this.prisma.client.items.findUnique({ where: { id: Number(line.item_id) }, include: { item_media: true, item_occupation: true } });
          return {
            item: this.convertBigIntToNumber(item),
            event_line: this.convertBigIntToNumber(line),
            media_count: item?.item_media?.length || 0,
            occupation_count: item?.item_occupation?.length || 0,
            price_ht: Number(line.price_ht) || 0,
            tva_value: Number(line.tva_value) || 0,
            discount: Number(line.discount) || 0,
            price_ttc: (Number(line.price_ht) * (1 + (Number(line.tva_value) / 100))),
            final_price: (Number(line.price_ht) * (1 + (Number(line.tva_value) / 100))) - Number(line.discount),
            start_date: line.start_date,
            end_date: line.end_date
          };
        })
      );
      let minStartDate: string | null = null;
      let maxEndDate: string | null = null;
      if (event.event_lines && event.event_lines.length > 0) {
        const validStartDates = event.event_lines.map(line => line.start_date).filter((date: any) => date);
        const validEndDates = event.event_lines.map(line => line.end_date).filter((date: any) => date);
        if (validStartDates.length > 0) {
          const startTimestamps = validStartDates.map((d: any) => {
            if (typeof d === 'object') { return new Date(d).getTime(); }
            else if (typeof d === 'string') {
              const timestamp = d.trim().slice(1, -1);
              return new Date(timestamp).getTime();
            }
            return 0;
          });
          minStartDate = new Date(Math.min(...startTimestamps)).toISOString();
        }
        if (validEndDates.length > 0) {
          const endTimestamps = validEndDates.map((d: any) => {
            if (typeof d === 'object') { return new Date(d).getTime(); }
            else if (typeof d === 'string') {
              const timestamp = d.trim().slice(1, -1);
              return new Date(timestamp).getTime();
            }
            return 0;
          });
          maxEndDate = new Date(Math.max(...endTimestamps)).toISOString();
        }
      }
      const totalPrice = itemsWithDetails.reduce((sum, itemDetail) => { return sum + (itemDetail.final_price || 0); }, 0);
      return {
        event_id: event.id,
        event_title: 'Event',
        items_used: itemsUsed,
        unique_items_used: uniqueItemsUsed,
        total_price: totalPrice,
        items_with_details: itemsWithDetails,
        start_date: minStartDate,
        end_date: maxEndDate,
        event_duration_days: minStartDate && maxEndDate ? Math.ceil((new Date(maxEndDate).getTime() - new Date(minStartDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
      };
    } catch (error) { throw new BadRequestException(error.message || 'Error getting event statistics'); }
  }
  async createComplexEvent(
    companyId: number,
    clientId: number,
    eventStartDate: Date,
    eventEndDate: Date,
    itemsWithDates: Array<{
      itemId: number;
      itemStartDate: Date;
      itemEndDate: Date;
      priceHt: number;
      tvaValue: number;
      discount: number;
    }>,
    title: string,
    category: string,
    guests: number,
    description: string,
    user: any
  ) {
    try {
      for (const item of itemsWithDates) {
        if (item.itemStartDate < eventStartDate || item.itemStartDate > eventEndDate || item.itemEndDate < eventStartDate || item.itemEndDate > eventEndDate) {
          throw new BadRequestException(`Item (ID: ${item.itemId}) dates must be within event start and end dates`);
        }
      }
      const event = await this.prisma.client.events.create({
        data: {
          company_id: companyId,
          client_id: clientId,
          title: title,
          category: category,
          guests: guests,
          description: description,
          start_date: eventStartDate,
          end_date: eventEndDate,
          status: 1
        }
      });
      await this.logService.createLogForUserAction(Number(user.id), 'events', Number(event.id), 'create', `Event created`);
      const createdItems = await this.prisma.client.$transaction(async (prisma) => {
        const createdEventLines: any[] = [];
        for (const itemData of itemsWithDates) {
          const eventLine = await prisma.event_lines.create({
            data: {
              event_id: event.id,
              item_id: itemData.itemId,
              start_date: itemData.itemStartDate,
              end_date: itemData.itemEndDate,
              price_ht: itemData.priceHt,
              tva_value: itemData.tvaValue,
              price_ttc: itemData.priceHt * (1 + (itemData.tvaValue / 100)),
              discount: itemData.discount
            }
          });
          await this.logService.createLogForUserAction(Number(user.id), 'event_lines', Number(eventLine.id), 'create', `Event line created`);
          const newItemOccupation = await prisma.item_occupation.create({ data: { item_id: itemData.itemId, event_line_id: eventLine.id, start_date: itemData.itemStartDate, end_date: itemData.itemEndDate } });
          await this.logService.createLogForUserAction(Number(user.id), 'item_occupation', Number(newItemOccupation.id), 'create', `Item occupation created`);
          createdEventLines.push(eventLine);
        }
        return createdEventLines;
      });
      const safeEvent = this.convertBigIntToNumber({ ...event, event_lines: createdItems });
      return { message: 'Event created successfully with all related data', event: safeEvent };
    } catch (error) { throw new BadRequestException(error.message || 'Error creating complex event'); }
  }
  async updateComplexEvent(
    eventId: number,
    companyId: number,
    clientId: number,
    eventStartDate: Date,
    eventEndDate: Date,
    itemsWithDates: Array<{
      id?: number;
      itemId: number;
      itemStartDate: Date;
      itemEndDate: Date;
      priceHt: number;
      tvaValue: number;
      discount: number;
      status?: number;
    }>,
    title: string,
    category: string,
    guests: number,
    description: string,
    user: any
  ) {
    try {
      await this.prisma.client.$transaction(async (prisma) => {
        const existingEvent = await prisma.events.findUnique({ where: { id: eventId }, include: { event_lines: true } });
        if (!existingEvent) { throw new BadRequestException('Event not found'); }
        const isSuperAdmin = Number(user.role_id) === 1;
        const isCompanyUser = Number(user.company_id) === Number(existingEvent.company_id);
        const isEventOwner = Number(user.id) === Number(existingEvent.client_id);
        if (!isSuperAdmin && !isCompanyUser && !isEventOwner) { throw new UnauthorizedException('You are not authorized to update this event.'); }
        await prisma.events.update({
          where: { id: eventId },
          data: {
            company_id: companyId,
            client_id: clientId,
            start_date: eventStartDate,
            end_date: eventEndDate,
            title: title,
            category: category,
            guests: guests,
            description: description,
            status: 1
          }
        });
        await this.logService.createLogForUserAction(Number(user.id), 'events', Number(eventId), 'update', `Event updated`);
        const existingLineIds = existingEvent.event_lines.map(line => line.id);
        const incomingLineIds = itemsWithDates.map(item => item.id).filter((id): id is number => id !== undefined);
        const linesToDelete = existingLineIds.filter(id => !incomingLineIds.includes(Number(id)));
        if (linesToDelete.length > 0) {
          for (const lineId of linesToDelete) { await this.logService.createLogForUserAction(Number(user.id), 'event_lines', Number(lineId), 'delete', `Event line deleted`); }
          for (const lineId of linesToDelete) { await this.logService.createLogForUserAction(Number(user.id), 'item_occupation', Number(lineId), 'delete', `Item occupation deleted`); }
          await prisma.item_occupation.deleteMany({ where: { event_line_id: { in: linesToDelete } } });
          await prisma.event_lines.deleteMany({ where: { id: { in: linesToDelete } } });
        }
        for (const itemData of itemsWithDates) {
          const startDate = itemData.itemStartDate instanceof Date ? itemData.itemStartDate : new Date(itemData.itemStartDate);
          const endDate = itemData.itemEndDate instanceof Date ? itemData.itemEndDate : new Date(itemData.itemEndDate);
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) { throw new BadRequestException(`Invalid dates for item ${itemData.itemId}`); }
          const lineData = {
            event_id: eventId,
            item_id: itemData.itemId,
            start_date: startDate,
            end_date: endDate,
            price_ht: Number(itemData.priceHt),
            tva_value: Number(itemData.tvaValue),
            price_ttc: Number(itemData.priceHt) * (1 + (Number(itemData.tvaValue) / 100)),
            discount: Number(itemData.discount)
          };
          if (itemData.id) {
            const updatedEventLine = await prisma.event_lines.update({ where: { id: itemData.id }, data: lineData });
            await this.logService.createLogForUserAction(Number(user.id), 'event_lines', Number(updatedEventLine.id), 'update', `Event line updated`);
            const occupation = await prisma.item_occupation.findFirst({ where: { event_line_id: itemData.id } });
            if (occupation) {
              const updatedOccupation = await prisma.item_occupation.update({ where: { id: occupation.id }, data: { item_id: itemData.itemId, start_date: startDate, end_date: endDate, ...(itemData.status !== undefined ? { status: itemData.status } : {}) } });
              await this.logService.createLogForUserAction(Number(user.id), 'item_occupation', Number(updatedOccupation.id), 'update', `Item occupation updated`);
            } else {
              const newOccupation = await prisma.item_occupation.create({ data: { item_id: itemData.itemId, event_line_id: updatedEventLine.id, start_date: startDate, end_date: endDate, ...(itemData.status !== undefined ? { status: itemData.status } : {}) } });
              await this.logService.createLogForUserAction(Number(user.id), 'item_occupation', Number(newOccupation.id), 'create', `Item occupation created for existing event line`);
            }
          } else {
            const newEventLine = await prisma.event_lines.create({ data: lineData });
            await this.logService.createLogForUserAction(Number(user.id), 'event_lines', Number(newEventLine.id), 'create', `Event line created`);
            const newItemOccupation = await prisma.item_occupation.create({ data: { item_id: itemData.itemId, event_line_id: newEventLine.id, start_date: startDate, end_date: endDate, ...(itemData.status !== undefined ? { status: itemData.status } : {}) } });
            await this.logService.createLogForUserAction(Number(user.id), 'item_occupation', Number(newItemOccupation.id), 'create', `Item occupation created`);
          }
        }
      });
      const result = await this.prisma.client.events.findUnique({ where: { id: eventId }, include: { event_lines: true } });
      return { message: 'Event updated successfully with all related data', event: this.convertBigIntToNumber(result) };
    } catch (error) { throw new BadRequestException(error.message || 'Error updating complex event'); }
  }
}