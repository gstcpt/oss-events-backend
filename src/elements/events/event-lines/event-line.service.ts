import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEventLineDto } from './dto/create-event-line.dto';
import { UpdateEventLineDto } from './dto/update-event-line.dto';

@Injectable()
export class EventLineService {
  constructor(private prisma: PrismaService) { }

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

  async create(createEventLineDto: CreateEventLineDto, user: any) {
    const event = await this.prisma.client.events.findUnique({ where: { id: createEventLineDto.event_id } });
    if (!event) { throw new BadRequestException('Event not found'); }
    if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(event.company_id)) { throw new UnauthorizedException('You are not authorized to create event lines for this event.'); }
    const eventLine = await this.prisma.client.event_lines.create({ data: createEventLineDto });
    return this.convertBigIntToNumber(eventLine);
  }

  async findAll(user: any) {
    const where: any = {};
    if (Number(user.role_id) !== 1) { where.events = { company_id: user.company_id }; }
    const eventLines = await this.prisma.client.event_lines.findMany({ where, include: { events: true } });
    return this.convertBigIntToNumber(eventLines);
  }

  async findOne(id: number, user: any) {
    const eventLine = await this.prisma.client.event_lines.findUnique({ where: { id }, include: { events: true } });
    if (!eventLine) { throw new BadRequestException('Event line not found'); }
    if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(eventLine.events.company_id)) { throw new UnauthorizedException('You are not authorized to view this event line.'); }
    return this.convertBigIntToNumber(eventLine);
  }

  async update(id: number, updateEventLineDto: UpdateEventLineDto, user: any) {
    const eventLineToUpdate = await this.prisma.client.event_lines.findUnique({ where: { id }, include: { events: true } });
    if (!eventLineToUpdate) { throw new BadRequestException('Event line not found'); }
    if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(eventLineToUpdate.events.company_id)) { throw new UnauthorizedException('You are not authorized to update this event line.'); }
    const eventLine = await this.prisma.client.event_lines.update({ where: { id }, data: updateEventLineDto });
    return this.convertBigIntToNumber(eventLine);
  }

  async remove(id: number, user: any) {
    const eventLineToDelete = await this.prisma.client.event_lines.findUnique({ where: { id }, include: { events: true } });
    if (!eventLineToDelete) { throw new BadRequestException('Event line not found'); }
    if (Number(user.role_id) !== 1 && Number(user.company_id) !== Number(eventLineToDelete.events.company_id)) { throw new UnauthorizedException('You are not authorized to delete this event line.'); }
    const eventLine = await this.prisma.client.event_lines.delete({ where: { id } });
    return this.convertBigIntToNumber(eventLine);
  }
}