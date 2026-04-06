import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePackLineDto } from './dto/create-pack-line.dto';
import { UpdatePackLineDto } from './dto/update-pack-line.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PackLineService {
  constructor(private prisma: PrismaService) { }
  private readonly logger = new Logger(PackLineService.name);
  async create(createPackLineDto: CreatePackLineDto) {
    this.logger.log(`Creating a pack line with data: ${JSON.stringify(createPackLineDto)}`);
    try {
      const { pack_id, module_id, price_ht, tva_value, price_ttc, discount } = createPackLineDto;
      const data: any = {packs: {connect: { id: Number(pack_id) },}, price_ht, tva_value, price_ttc, discount};
      if (module_id) {data.modules = {connect: { id: module_id }};}
      const result = await this.prisma.client.pack_lines.create({data});
      this.logger.log(`Successfully created pack line with id: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to create pack line', error.stack);
      throw error;
    }
  }
  async findAll() {return this.prisma.client.pack_lines.findMany();}
  async findOne(id: number) {return this.prisma.client.pack_lines.findUnique({where: { id }});}
  async findByPack(packId: number) {return this.prisma.client.pack_lines.findMany({where: { pack_id: packId }})}
  async update(id: number, updatePackLineDto: UpdatePackLineDto) {
    this.logger.log(`Updating pack line with id ${id} and data: ${JSON.stringify(updatePackLineDto)}`);
    try {
      const { pack_id, module_id, price_ht, tva_value, price_ttc, discount } = updatePackLineDto;
      const data: any = {};
      if (pack_id !== undefined) { data.packs = { connect: { id: Number(pack_id) } }; }
      if (module_id !== undefined) { if (module_id === null) { data.modules = { disconnect: true }; } else { data.modules = { connect: { id: module_id } }; } }
      if (price_ht !== undefined) data.price_ht = price_ht;
      if (tva_value !== undefined) data.tva_value = tva_value;
      if (price_ttc !== undefined) data.price_ttc = price_ttc;
      if (discount !== undefined) data.discount = discount;
      return this.prisma.client.pack_lines.update({ where: { id }, data });
    } catch (error) {
      this.logger.error(`Failed to update pack line with id ${id}`, error.stack);
      throw error;
    }
  }
  async remove(id: number) {return this.prisma.client.pack_lines.delete({where: { id }});}
}