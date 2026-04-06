import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTagOptionDto } from './dto/create-tag-option.dto';
import { UpdateTagOptionDto } from './dto/update-tag-option.dto';

@Injectable()
export class TagOptionService {
  constructor(private prisma: PrismaService) {}

  async create(createTagOptionDto: CreateTagOptionDto) {
    return this.prisma.client.tag_options.create({
      data: createTagOptionDto,
    });
  }

  async findAll() {
    return this.prisma.client.tag_options.findMany();
  }

  async findByTagId(tagId: number) {
    return this.prisma.client.tag_options.findMany({
      where: { tag_id: tagId },
      orderBy: { id: 'asc' }
    });
  }

  async findOne(id: number) {
    return this.prisma.client.tag_options.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateTagOptionDto: UpdateTagOptionDto) {
    return this.prisma.client.tag_options.update({
      where: { id },
      data: updateTagOptionDto,
    });
  }

  async remove(id: number) {
    return this.prisma.client.tag_options.delete({
      where: { id },
    });
  }
}