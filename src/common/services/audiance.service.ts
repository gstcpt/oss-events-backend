import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AudianceService {
    constructor(private prisma: PrismaService) { }

    async createVisite() {
        try {}
        catch (error) { throw new BadRequestException('Error updating audiance: ' + error.message); }
    };
}