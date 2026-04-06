import { Injectable, Scope, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LogService } from '../../common/services/log.service';
import * as bcrypt from 'bcrypt';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(private prisma: PrismaService, private logService: LogService) { }
  private convertBigIntToNumber(obj: any): any {
    if (obj === null || obj === undefined) { return obj; }
    if (typeof obj === 'bigint') { return Number(obj); }
    if (obj instanceof Date) { return obj; }
    if (Array.isArray(obj)) { return obj.map(item => this.convertBigIntToNumber(item)); }
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) { result[key] = this.convertBigIntToNumber(obj[key]); }
      return result;
    }
    return obj;
  }
  async create(createUserDto: CreateUserDto, currentUser: any) {
    try {
      const userTestUsername = await this.prisma.client.users.findUnique({ where: { username: createUserDto.username } });
      if (userTestUsername) throw new BadRequestException('Username already exists.');
      const userTestEmail = await this.prisma.client.users.findUnique({ where: { email: createUserDto.email } });
      if (userTestEmail) throw new BadRequestException('Email already exists.');
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const data: any = {
        firstname: createUserDto.firstname,
        midname: createUserDto.midname,
        lastname: createUserDto.lastname,
        phone: createUserDto.phone,
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
        role_id: createUserDto.role_id,
        company_id: createUserDto.company_id,
        status: createUserDto.status ? 1 : 0
      };
      const result = await this.prisma.client.users.create({ data });
      await this.logService.createLogForUserAction(Number(currentUser.id), 'users', Number(result.id), 'create', `User created: ${data.firstname} ${data.midname} ${data.lastname} with username: ${data.username} and email: ${data.email}`);
      return this.convertBigIntToNumber(result);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error creating user');
    }
  }
  async update(id: bigint, updateUserDto: UpdateUserDto, currentUser: any) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id } });
      if (!user) throw new BadRequestException('User not found');
      const data: any = {};
      if (updateUserDto.firstname !== undefined) data.firstname = updateUserDto.firstname;
      if (updateUserDto.midname !== undefined) data.midname = updateUserDto.midname;
      if (updateUserDto.lastname !== undefined) data.lastname = updateUserDto.lastname;
      if (updateUserDto.phone !== undefined) data.phone = updateUserDto.phone;
      if (updateUserDto.username !== undefined) data.username = updateUserDto.username;
      if (updateUserDto.email !== undefined) data.email = updateUserDto.email;
      if (updateUserDto.password !== undefined) { data.password = await bcrypt.hash(updateUserDto.password, 10); }
      if (updateUserDto.status !== undefined) data.status = updateUserDto.status ? 1 : 0;
      if (updateUserDto.company_id !== undefined) data.company_id = updateUserDto.company_id;
      if (updateUserDto.role_id !== undefined) data.role_id = updateUserDto.role_id;
      const result = await this.prisma.client.users.update({ where: { id }, data });
      await this.logService.createLogForUserAction(Number(currentUser.id), 'users', Number(id), 'update', `User updated: ${result.firstname} ${result.midname} ${result.lastname} with username: ${result.username} and email: ${result.email}`);
      return this.convertBigIntToNumber(result);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error updating user');
    }
  }
  async findOne(id: bigint) { try { const result = await this.prisma.client.users.findUnique({ where: { id }, include: { roles: true, companies_user: true }, }); return this.convertBigIntToNumber(result); } catch (error) { throw new BadRequestException('Error finding user by id'); } }
  async remove(id: bigint, currentUser: any) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id } });
      if (!user) { throw new BadRequestException('User not found'); }
      await this.logService.createLogForUserAction(Number(currentUser.id), 'users', Number(id), 'remove', `User deleted: ${user.firstname} ${user.midname} ${user.lastname} with username: ${user.username} and email: ${user.email}`); const result = await this.prisma.client.users.delete({ where: { id } });
      return this.convertBigIntToNumber(result);
    } catch (error) { throw new BadRequestException('Error deleting user'); }
  }
  async findAll() { try { const result = await this.prisma.client.users.findMany(); return this.convertBigIntToNumber(result); } catch (error) { throw new BadRequestException('Error finding all users'); } }
  async findAllByRole(roleId: bigint) { try { const result = await this.prisma.client.users.findMany({ where: { role_id: roleId } }); return this.convertBigIntToNumber(result); } catch (error) { throw new BadRequestException('Error finding users by role'); } }
  async findAllByStatus(status: boolean) { try { const result = await this.prisma.client.users.findMany({ where: { status: status ? 1 : 0 } }); return this.convertBigIntToNumber(result); } catch (error) { throw new BadRequestException('Error finding users by status'); } }
  async findAllByCompany(companyId: bigint) {
    try {
      let result;
      if (companyId && companyId !== BigInt(0)) { result = await this.prisma.client.users.findMany({ where: { status: 1, company_id: companyId }, orderBy: { firstname: 'asc' } }); }
      else { result = await this.prisma.client.users.findMany(); }
      return this.convertBigIntToNumber(result);
    } catch (error) {
      throw new BadRequestException('Error finding users by company: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  async findProvidersByCompany(companyId: bigint) {
    try {
      const providerRole = await this.prisma.client.roles.findFirst({ where: { title: 'Provider' } });
      if (!providerRole) { throw new BadRequestException('Provider role not found.'); }
      const whereConditions: { role_id: bigint; company_id?: bigint } = { role_id: providerRole.id };
      if (companyId) { whereConditions.company_id = companyId; }
      const result = await this.prisma.client.users.findMany({ where: whereConditions });
      return this.convertBigIntToNumber(result);
    } catch (error) {
      if (error instanceof BadRequestException) { throw error; }
      throw new BadRequestException('Error finding providers by company');
    }
  }
  async findAllUsersByRoleAndCompany(roleId: bigint, companyId: bigint) {
    try {
      const result = await this.prisma.client.users.findMany({ where: { role_id: roleId, company_id: companyId } });
      return this.convertBigIntToNumber(result);
    } catch (error) {
      console.log("Error finding users by role and company", error);
      console.error("Error finding users by role and company", error);
      throw new BadRequestException('Error finding users by role and company');
    }
  }
  async findAllUsersByStatusAndCompany(status: boolean, companyId: bigint) { try { const result = await this.prisma.client.users.findMany({ where: { status: status ? 1 : 0, company_id: companyId } }); return this.convertBigIntToNumber(result); } catch (error) { throw new BadRequestException('Error finding users by status and company'); } }
  async changeCompany(id: bigint, companyId: bigint) {
    try {
      const user = await this.prisma.client.users.findUnique({ where: { id } });
      if (!user) throw new BadRequestException('User not found');
      const result = await this.prisma.client.users.update({ where: { id }, data: { company_id: companyId } });
      return this.convertBigIntToNumber(result);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error changing user company');
    }
  }
  async updateRootCompany(id: number | bigint) {
    try {
      const idBig: bigint = typeof id === 'bigint' ? id : BigInt(Number(id));
      const user = await this.prisma.client.users.findUnique({ where: { id: idBig } });
      if (!user) { throw new BadRequestException('User not found'); }
      const updated = await this.prisma.client.users.update({ where: { id: idBig }, data: { company_id: null } });
      return this.convertBigIntToNumber(updated);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error updating user company');
    }
  }
  async findAdmins(currentUserId: number) {
    try {
      const adminRole = await this.prisma.client.roles.findFirst({ where: { title: 'Admin' } });
      if (!adminRole) throw new BadRequestException('Admin role not found');
      let result;
      if (!currentUserId) throw new BadRequestException('Current user ID is required');
      const currentUser = await this.prisma.client.users.findUnique({ where: { id: BigInt(currentUserId) } });
      if (!currentUser?.role_id) throw new BadRequestException('Current user not found');
      const userRole = await this.prisma.client.roles.findFirst({ where: { id: currentUser.role_id } });
      if (!userRole) throw new BadRequestException('User role not found');
      if (userRole.title === 'Root') { result = await this.prisma.client.users.findMany({ where: { role_id: adminRole.id }, include: { companies_user: { select: { id: true, title: true } }, roles: { select: { id: true, title: true } } } }); }
      else if (userRole.title === 'Admin') {
        result = await this.prisma.client.users.findMany({ where: { role_id: adminRole.id, company_id: currentUser.company_id ? BigInt(currentUser.company_id) : null }, include: { companies_user: { select: { id: true, title: true } }, roles: { select: { id: true, title: true } } } });
      } else { result = []; }
      return this.convertBigIntToNumber(result);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error finding admins');
    }
  }
  async findProviders(currentUserId: number) {
    try {
      const providerRole = await this.prisma.client.roles.findFirst({ where: { title: 'Provider' } });
      if (!providerRole) throw new BadRequestException('Provider role not found');
      let result;
      if (!currentUserId) throw new BadRequestException('Current user ID is required');
      const currentUser = await this.prisma.client.users.findUnique({ where: { id: BigInt(currentUserId) } });
      if (!currentUser?.role_id) throw new BadRequestException('Current user not found');
      const userRole = await this.prisma.client.roles.findFirst({ where: { id: currentUser.role_id } });
      if (!userRole) throw new BadRequestException('User role not found');
      if (userRole.title === 'Root') { result = await this.prisma.client.users.findMany({ where: { role_id: providerRole.id }, include: { companies_user: { select: { id: true, title: true } }, roles: { select: { id: true, title: true } } } }); }
      else if (userRole.title === 'Admin') {
        result = await this.prisma.client.users.findMany({ where: { role_id: providerRole.id, company_id: currentUser.company_id ? BigInt(currentUser.company_id) : null }, include: { companies_user: { select: { id: true, title: true } }, roles: { select: { id: true, title: true } } } });
      } else { result = []; }
      return this.convertBigIntToNumber(result);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error finding providers');
    }
  }
  async findClients(currentUserId: number) {
    try {
      const clientRole = await this.prisma.client.roles.findFirst({ where: { title: 'Client' } });
      if (!clientRole) throw new BadRequestException('Client role not found');
      let result;
      if (!currentUserId) throw new BadRequestException('Current user ID is required');
      const currentUser = await this.prisma.client.users.findUnique({ where: { id: BigInt(currentUserId) } });
      if (!currentUser?.role_id) throw new BadRequestException('Current user not found');
      const userRole = await this.prisma.client.roles.findFirst({ where: { id: currentUser.role_id } });
      if (!userRole) throw new BadRequestException('User role not found');
      if (userRole.title === 'Root') { result = await this.prisma.client.users.findMany({ where: { role_id: clientRole.id }, include: { companies_user: { select: { id: true, title: true } }, roles: { select: { id: true, title: true } } } }); }
      else if (userRole.title === 'Admin') {
        result = await this.prisma.client.users.findMany({ where: { role_id: clientRole.id, company_id: currentUser.company_id ? BigInt(currentUser.company_id) : null }, include: { companies_user: { select: { id: true, title: true } }, roles: { select: { id: true, title: true } } } });
      } else { result = []; }
      return this.convertBigIntToNumber(result);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error finding admins');
    }
  }
  async myProfile(currentUserId: number) {
    try {
      if (!currentUserId) throw new BadRequestException('Current user ID is required');
      const currentUser = await this.prisma.client.users.findUnique({ where: { id: BigInt(currentUserId) } });
      if (!currentUser?.role_id) throw new BadRequestException('Current user not found');
      const userRole = await this.prisma.client.roles.findFirst({ where: { id: currentUser.role_id } });
      if (!userRole) throw new BadRequestException('User role not found');
      return this.findOne(currentUser.id);
    }
    catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error finding profile');
    }
  }
  async createAdmin(createUserDto: CreateUserDto, currentUser: any) {
    try {
      const adminRole = await this.prisma.client.roles.findFirst({ where: { title: 'Admin' } });
      if (!adminRole) throw new BadRequestException('Admin role not found');
      createUserDto.role_id = Number(adminRole.id);
      if (currentUser.role === 'Root') { } else if (currentUser.role === 'Admin') { createUserDto.company_id = Number(currentUser.company_id); }
      return this.create(createUserDto, currentUser);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error creating admin');
    }
  }
  async updateAdmin(id: bigint, updateUserDto: UpdateUserDto, currentUser: any) {
    try {
      const adminRole = await this.prisma.client.roles.findFirst({ where: { title: 'Admin' } });
      if (!adminRole) throw new BadRequestException('Admin role not found');
      updateUserDto.role_id = Number(adminRole.id);
      if (currentUser.role === 'Admin') { delete updateUserDto.company_id; }
      return this.update(id, updateUserDto, currentUser);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error updating admin');
    }
  }
  async createProvider(createUserDto: CreateUserDto, currentUser: any) {
    try {
      const providerRole = await this.prisma.client.roles.findFirst({ where: { title: 'Provider' } });
      if (!providerRole) throw new BadRequestException('Provider role not found');
      createUserDto.role_id = Number(providerRole.id);
      if (currentUser.role === 'Root') { } else if (currentUser.role === 'Admin') { createUserDto.company_id = Number(currentUser.company_id); }
      return this.create(createUserDto, currentUser);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error creating provider');
    }
  }
  async updateProvider(id: bigint, updateUserDto: UpdateUserDto, currentUser: any) {
    try {
      const providerRole = await this.prisma.client.roles.findFirst({ where: { title: 'Provider' } });
      if (!providerRole) throw new BadRequestException('Provider role not found');
      updateUserDto.role_id = Number(providerRole.id);
      if (currentUser.role === 'Admin') { delete updateUserDto.company_id; }
      return this.update(id, updateUserDto, currentUser);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error updating provider');
    }
  }
  async createClient(createUserDto: CreateUserDto, currentUser: any) {
    try {
      const clientRole = await this.prisma.client.roles.findFirst({ where: { title: 'Client' } });
      if (!clientRole) throw new BadRequestException('Client role not found');
      createUserDto.role_id = Number(clientRole.id);
      if (currentUser.role === 'Root') { } else if (currentUser.role === 'Admin') { createUserDto.company_id = Number(currentUser.company_id); }
      return this.create(createUserDto, currentUser);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error creating client');
    }
  }
  async updateClient(id: bigint, updateUserDto: UpdateUserDto, currentUser: any) {
    try {
      const clientRole = await this.prisma.client.roles.findFirst({ where: { title: 'Client' } });
      if (!clientRole) throw new BadRequestException('Client role not found');
      updateUserDto.role_id = Number(clientRole.id);
      if (currentUser.role === 'Admin') { delete updateUserDto.company_id; }
      return this.update(id, updateUserDto, currentUser);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error updating client');
    }
  }
  async updateMyProfile(currentUser: any, updateUserDto: UpdateUserDto) {
    try {
      const id = BigInt(currentUser.id);
      delete updateUserDto.role_id;
      delete updateUserDto.company_id;
      if (updateUserDto.avatar && updateUserDto.avatar.startsWith('/images/users/')) { return this.update(id, updateUserDto, currentUser); } else if (updateUserDto.avatar) { delete updateUserDto.avatar; }
      return this.update(id, updateUserDto, currentUser);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException("Error updating profile");
    }
  }
}