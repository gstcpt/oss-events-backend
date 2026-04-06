import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class PacksService {
  constructor(private prisma: PrismaService, private logService: LogService) { }
  async create(createPackDto: CreatePackDto) {
    try {
      const pack = await this.prisma.client.packs.create({ data: createPackDto });
      await this.logService.createLogForUserAction(Number(pack.id), 'packs', Number(pack.id), 'create', `Pack created: ${pack}`);
      return { message: 'Pack created successfully', pack };
    } catch (error) { throw new BadRequestException('Error creating pack'); }
  }
  async findAll() {
    const packs = await this.prisma.client.packs.findMany({ include: { subscriptions: { include: { companies: true } }, pack_lines: { include: { modules: true } } }, });
    return packs.map((pack) => ({ ...pack, price: pack.price ? pack.price.toNumber() : null, pack_lines: pack.pack_lines.map((pl) => ({ ...pl, price_ht: pl.price_ht ? pl.price_ht.toNumber() : null, tva_value: pl.tva_value ? pl.tva_value.toNumber() : null, price_ttc: pl.price_ttc ? pl.price_ttc.toNumber() : null, discount: pl.discount ? pl.discount.toNumber() : null })), }));
  }
  async findOne(id: number) {
    const pack = await this.prisma.client.packs.findUnique({ where: { id }, include: { subscriptions: { include: { companies: true } }, pack_lines: { include: { modules: true } } } });
    if (pack) { return { ...pack, price: pack.price ? pack.price.toNumber() : null, pack_lines: pack.pack_lines.map((pl) => ({ ...pl, price_ht: pl.price_ht ? pl.price_ht.toNumber() : null, tva_value: pl.tva_value ? pl.tva_value.toNumber() : null, price_ttc: pl.price_ttc ? pl.price_ttc.toNumber() : null, discount: pl.discount ? pl.discount.toNumber() : null })) }; }
    return null;
  }
  async update(id: number, updatePackDto: UpdatePackDto) {
    try {
      const pack = await this.prisma.client.packs.update({ where: { id }, data: updatePackDto });
      await this.logService.createLogForUserAction(Number(pack.id), 'packs', Number(pack.id), 'update', `Pack updated: ${pack}`);
      return { message: 'Pack updated successfully', pack };
    } catch (error) { throw new BadRequestException('Error updating pack'); }
  }
  async remove(id: number) {
    try {
      const pack = await this.prisma.client.packs.delete({ where: { id } });
      await this.logService.createLogForUserAction(Number(pack.id), 'packs', Number(pack.id), 'delete', `Pack deleted: ${pack}`);
      return { message: 'Pack deleted successfully', pack };
    } catch (error) { throw new BadRequestException('Error deleting pack'); }
  }
}