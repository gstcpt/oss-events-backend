import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateItemMediaDto } from './dto/create-item-media.dto';
import { UpdateItemMediaDto } from './dto/update-item-media.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class ItemMediaService {
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
  async create(createItemMediaDto: CreateItemMediaDto) {
    try {
      const itemMedia = await this.prisma.client.item_media.create({ data: createItemMediaDto });
      return { message: 'Item media created successfully', itemMedia };
    } catch (error) { throw new BadRequestException('Error creating item media: ' + error.message); }
  }
  async findAll() {
    const media = await this.prisma.client.item_media.findMany({ include: { items: true } });
    return media;
  }
  async findAllGroupedByItem() {
    const media = await this.prisma.client.item_media.findMany({ include: { items: true } });
    const groupedMedia: Record<number, any> = {};
    media.forEach(mediaItem => {
      const itemId = Number(mediaItem.item_id);
      if (!groupedMedia[itemId]) { groupedMedia[itemId] = { item: mediaItem.items, media: [] }; }
      groupedMedia[itemId].media.push(mediaItem);
    });
    const result = Object.values(groupedMedia).sort((a, b) => (a.item?.title || '').localeCompare(b.item?.title || ''));
    return result;
  }
  async findMediaByItemId(itemId: number) {
    const media = await this.prisma.client.item_media.findMany({ where: { item_id: itemId }, include: { items: true } });
    return media.map(item => this.convertBigIntToNumber(item));
  }
  async findOne(id: number) { return this.prisma.client.item_media.findUnique({ where: { id } }); }
  async update(id: number, updateItemMediaDto: UpdateItemMediaDto) {
    try {
      const itemMedia = await this.prisma.client.item_media.update({ where: { id }, data: updateItemMediaDto });
      return { message: 'Item media updated successfully', itemMedia };
    } catch (error) { throw new BadRequestException('Error updating item media'); }
  }
  async remove(id: number) {
    try {
      const itemMedia = await this.prisma.client.item_media.findUnique({ where: { id: Number(id) } });
      if (!itemMedia) { throw new BadRequestException('Item media not found'); }
      const deletedItemMedia = await this.prisma.client.item_media.delete({ where: { id: Number(id) } });
      return { message: 'Item media deleted successfully', itemMedia: deletedItemMedia };
    } catch (error) {
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) { throw new BadRequestException('Item media not found'); }
      throw new BadRequestException('Error deleting item media: ' + error.message);
    }
  }
}