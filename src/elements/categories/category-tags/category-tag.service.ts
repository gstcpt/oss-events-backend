import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCategoryTagDto } from './dto/create-category-tag.dto';
import { UpdateCategoryTagDto } from './dto/update-category-tag.dto';

@Injectable()
export class CategoryTagService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryTagDto: CreateCategoryTagDto) {
    return this.prisma.client.category_tags.create({
      data: createCategoryTagDto,
      include: { categories: true, tags: true },
    });
  }

  async findAll() {
    return this.prisma.client.category_tags.findMany({
      include: { categories: true, tags: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.client.category_tags.findUnique({
      where: { id },
      include: { categories: true, tags: true },
    });
  }

  async update(id: number, updateCategoryTagDto: UpdateCategoryTagDto) {
    return this.prisma.client.category_tags.update({
      where: { id },
      data: updateCategoryTagDto,
      include: { categories: true, tags: true },
    });
  }

  async remove(id: number) {
    return this.prisma.client.category_tags.delete({
      where: { id },
    });
  }
}