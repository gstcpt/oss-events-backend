import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { LogService } from '../../common/services/log.service';

function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) { result[key] = serializeBigInt(obj[key]); }
    return result;
  }
  return obj;
}

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService, private logService: LogService) { }
  async create(createRoleDto: CreateRoleDto, currentUser: any) {
    try {
      const { title, permissionIds } = createRoleDto;
      const role = await this.prisma.client.roles.create({ data: { title } });
      if (permissionIds && permissionIds.length > 0) { await this.prisma.client.role_permission.createMany({ data: permissionIds.map((permissionId) => ({ role_id: role.id, permission_id: BigInt(permissionId) })) }); }
      await this.logService.createLogForUserAction(Number(currentUser.id), 'roles', Number(role.id), 'create', `Role created: ${title}`);
      const result = await this.findOneRaw(Number(role.id));
      return serializeBigInt(result);
    } catch (error) { throw new BadRequestException('Error creating role'); }
  }

  async findAll() {
    const result = await this.prisma.client.roles.findMany({ include: { role_permission: { include: { permissions: true } } } });
    return serializeBigInt(result);
  }

  async findOne(id: number) {
    const result = await this.findOneRaw(id);
    return serializeBigInt(result);
  }

  private async findOneRaw(id: number) { return this.prisma.client.roles.findUnique({ where: { id: BigInt(id) }, include: { role_permission: { include: { permissions: true } } } }); }

  async update(id: number, updateRoleDto: UpdateRoleDto, currentUser: any) {
    try {
      const { title, permissionIds } = updateRoleDto;
      if (title !== undefined) { await this.prisma.client.roles.update({ where: { id: BigInt(id) }, data: { title } }); }
      if (permissionIds) {
        await this.prisma.client.role_permission.deleteMany({ where: { role_id: BigInt(id) } });
        if (permissionIds.length > 0) {
          const existingPermissions = await this.prisma.client.permissions.findMany({
            where: { id: { in: permissionIds.map(pid => BigInt(pid)) } },
            select: { id: true }
          });
          const existingIds = existingPermissions.map(p => p.id);

          if (existingIds.length > 0) {
            await this.prisma.client.role_permission.createMany({
              data: existingIds.map((permissionId) => ({
                role_id: BigInt(id),
                permission_id: permissionId
              }))
            });
          }
        }
      }
      const role = await this.prisma.client.roles.findUnique({ where: { id: BigInt(id) } });
      if (!role) throw new BadRequestException('Role not found');
      await this.logService.createLogForUserAction(Number(currentUser.id), 'roles', Number(role.id), 'update', `Role updated: ${title ?? role.title}`);
      const result = await this.findOneRaw(id);
      return serializeBigInt(result);
    } catch (error) {
      throw new BadRequestException('Error updating role: ' + error.message);
    }
  }

  async remove(id: number, currentUser: any) {
    try {
      await this.prisma.client.role_permission.deleteMany({ where: { role_id: BigInt(id) } });
      const role = await this.prisma.client.roles.delete({ where: { id: BigInt(id) } });
      await this.logService.createLogForUserAction(Number(currentUser.id), 'roles', Number(role.id), 'delete', `Role deleted: ${role.title}`);
      return { message: 'Role deleted successfully', role: serializeBigInt(role) };
    } catch (error) { throw new BadRequestException('Error deleting role'); }
  }
}