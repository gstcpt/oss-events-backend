import { Injectable, OnModuleInit, OnModuleDestroy, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import type { PrismaClient } from '../../generated/prisma';
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient | null = null;
  constructor(private configService: ConfigService) { }
  private findGeneratedPrismaPackage(): any {
    const candidates = [
      path.join(process.cwd(), 'generated', 'prisma'),
      path.join(__dirname, '..', '..', 'generated', 'prisma'),
      path.join(__dirname, '..', '..', '..', 'generated', 'prisma'),
      path.join(__dirname, '..', '..', '..', '..', 'generated', 'prisma'),
      path.join(__dirname, '..', 'generated', 'prisma'),
    ];
    for (const candidate of candidates) {
      try {
        const pkg = require(candidate);
        return { pkg, used: candidate };
      } catch (err) { }
    }
    return null;
  }
  async onModuleInit() {
    if (this.prisma) return;
    const found = this.findGeneratedPrismaPackage();
    if (!found) {
      const tried = [path.join(process.cwd(), 'generated', 'prisma'), path.join(__dirname, '..', '..', 'generated', 'prisma'), path.join(__dirname, '..', '..', '..', 'generated', 'prisma')].join(', ');
      throw new Error(`Prisma client (generated) not found. Tried: ${tried}. ` + `Run "npx prisma generate" and ensure the generated client lives at ./generated/prisma. ` + `If you changed the generator output, update prisma.service require paths accordingly.`);
    }
    const { pkg, used } = found;
    const PrismaClientCtor = pkg?.PrismaClient || pkg?.default?.PrismaClient || pkg?.default || pkg;
    const url = this.configService.get<string>('DATABASE_URL');
    this.prisma = new PrismaClientCtor({ datasources: { db: { url: url } } }) as PrismaClient;
    await this.prisma.$connect();
  }
  get client(): PrismaClient {
    if (!this.prisma) { throw new Error('Prisma client not initialized. Call onModuleInit first.'); }
    return this.prisma;
  }
  async enableShutdownHooks(app: INestApplication) {
    if (!this.prisma) return;
    (this.prisma as any).$on('beforeExit', async () => { await app.close(); });
  }
  async onModuleDestroy() {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
    }
  }
  async transactional<T>(cb: (tx: PrismaClient) => Promise<T>): Promise<T> { return this.client.$transaction(cb); }
}
