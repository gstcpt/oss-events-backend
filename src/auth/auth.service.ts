import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../common/services/email.service';
import { LogService } from '../common/services/log.service';
import { NotificationService } from '../common/services/notification.service';
import { UserService } from '../actors/users/user.service';
import { ProviderService } from '../actors/users/providers/provider.service';
import { TenantService } from '../common/services/tenant.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private prisma: PrismaService, private jwtService: JwtService, private emailService: EmailService, private logService: LogService, private notificationService: NotificationService, private readonly userService: UserService, private readonly providerService: ProviderService, private readonly tenantService: TenantService) { }
  async register(registerDto: RegisterDto, req: Request) {
    const { firstname, lastname, username, email, password, origin, role_id } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verify bcrypt hash is exactly 60 characters (required for proper comparison)
    if (hashedPassword.length !== 60) {
      this.logger.error(`Password hash length incorrect: ${hashedPassword.length}, expected 60`);
      throw new BadRequestException('Password hashing failed. Please try again.');
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const company = await this.tenantService.getCompanyByOrigin(origin);
    if (!company) { throw new BadRequestException(`No company found for url: ${origin}`); }
    const existingUser = await this.prisma.client.users.findFirst({ where: { email, company_id: Number(company.id) } });
    if (existingUser) { throw new BadRequestException('User with this email already exists for this company'); }
    if (!role_id) { throw new BadRequestException('Role ID is required'); }
    try {
      let status = 1;
      if (role_id == 3) { status = 0; }
      const user = await this.prisma.client.users.create({ data: { firstname, lastname, username, email, password: hashedPassword, email_verification_token: token, email_verified: false, status: status, role_id: role_id, company_id: Number(company.id) } });
      await this.emailService.sendEmailVerification(email, token, company.title);
      await this.logService.createLogForUserAction(Number(user.id), 'users', Number(user.id), 'create', `User registered: ${username}`);
      const admin = await this.prisma.client.users.findMany({ where: { role_id: 2, company_id: Number(company.id) } });
      admin.map(async (a) => await this.notificationService.createNotification(Number(user.id), Number(a.id), `A new user ${user.id}: ${user.firstname} ${user.lastname} email: ${user.email} has been registered successfully for your company`));
      const { password: _, email_verification_token, ...safeUser } = user;
      return { safeUser, message: 'User registered. Please verify your email.' };
    }
    catch (error) {
      if (error.code === 'P2002') { throw new BadRequestException('Username already exists'); }
      throw error;
    }
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.client.users.findFirst({ where: { email_verification_token: token }, });
    if (user) {
      const company = await this.prisma.client.companies.findFirst({ where: { id: Number(user.company_id) } });
      await this.prisma.client.users.update({ where: { id: user.id }, data: { email_verified: true, email_verification_token: null } });
      if (company) { await this.emailService.sendEmailVerifier(user.email, company.title); }
      await this.logService.createLogForUserAction(Number(user.id), 'users', Number(user.id), 'email_verification', `Email verified for user: ${user.email}`);
      const data = { user_id: Number(user.id), email: user.email };
      const providerProfile = await this.providerService.create(data, user);
      await this.logService.createLogForUserAction(Number(user.id), 'provider_info', Number(providerProfile.id), 'create', `Provider profile created successfully: ${providerProfile.email}`);
      return { message: 'Email verified successfully' };
    }
    throw new BadRequestException('Invalid token');
  }

  async resendVerification(email: string, origin: string) {
    const user = await this.prisma.client.users.findFirst({ where: { email } });
    if (!user) { throw new BadRequestException('User not found'); }
    if (user.email_verified) { throw new BadRequestException('Email already verified'); }
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await this.prisma.client.users.update({ where: { id: user.id }, data: { email_verification_token: token } });
    const company = await this.tenantService.getCompanyByOrigin(origin);
    await this.emailService.sendEmailVerification(email, token, company?.title || 'Your Company');
    return { message: 'Verification email resent' };
  }

  async resetPassword(email: string, req: Request) {
    try {
      const origin = req.headers.origin as string;
      if (!origin) { throw new BadRequestException('Origin header not found in request'); }
      const company = await this.tenantService.getCompanyByOrigin(origin);
      if (!company) { throw new BadRequestException(`No company found for url: ${origin}`); }
      const user = await this.prisma.client.users.findFirst({ where: { email: email, company_id: Number(company.id) } });
      if (user) {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await this.prisma.client.users.update({ where: { id: user.id }, data: { password_reset_token: token, password_reset_token_expiry: new Date(Date.now() + 60 * 60 * 1000) } });
        await this.emailService.sendResetPassword(email, token, company.title);
        await this.logService.createLogForUserAction(Number(user.id), 'users', Number(user.id), 'password_reset_request', `Password reset requested for email: ${email}`);
        return { message: 'Reset token sent to email' };
      }
    } catch (error) { throw new BadRequestException('User not found'); }
  }

  async newPassword(token: string, newPassword: string) {
    const user = await this.prisma.client.users.findFirst({ where: { password_reset_token: token, password_reset_token_expiry: { gt: new Date() } } });
    if (user) {
      const company = await this.prisma.client.companies.findFirst({ where: { id: Number(user.company_id) } });
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Verify bcrypt hash is exactly 60 characters
      if (hashedPassword.length !== 60) {
        this.logger.error(`Password hash length incorrect in newPassword: ${hashedPassword.length}, expected 60`);
        throw new BadRequestException('Password hashing failed. Please try again.');
      }

      await this.prisma.client.users.update({ where: { id: user.id }, data: { password: hashedPassword, password_reset_token: null, password_reset_token_expiry: null } });
      if (company) { await this.emailService.sendPasswordChange(user.email, company.title); }
      await this.logService.createLogForUserAction(Number(user.id), 'users', Number(user.id), 'password_reset', 'Password reset successfully');
      return { message: 'Password updated successfully' };
    }
    throw new BadRequestException('Invalid or expired token');
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    try {
      const { email, password, origin } = loginDto;
      const company = await this.tenantService.getCompanyByOrigin(origin);
      if (!company) {
        this.logger.warn(`No company found for origin: ${origin}`);
        throw new BadRequestException(`No company found for url: ${origin}`);
      }
      this.logger.log(`Company found: ${company.title}`);
      const users = await this.prisma.client.users.findMany({ where: { email } });
      if (!users || users.length === 0) {
        this.logger.warn(`No user found for email: ${email}`);
        throw new BadRequestException('Invalid credentials. Please check your email and password.');
      }
      this.logger.log(`Found ${users.length} users with email: ${email}`);
      let user = users.find(u => Number(u.role_id) === 1);
      if (!user) {
        user = users.find(u => u.company_id === company.id);
      }
      if (!user) {
        this.logger.warn(`User with email ${email} not found for company ${company.title}`);
        throw new BadRequestException('Invalid credentials. Please check your email and password.');
      }
      this.logger.log(`User found for company: ${user.username}`);

      // Check if password hash is valid (should be exactly 60 characters for bcrypt)
      if (user.password.length !== 60) {
        this.logger.error(`Corrupted password hash detected for user ${user.email}: length ${user.password.length}, expected 60`);
        throw new BadRequestException('Your password appears to be corrupted. Please use "Forgot Password" to reset it.');
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        if (user) { await this.logService.createLogForUserAction(Number(user.id), 'users', Number(user.id), 'login_failed', `Failed login attempt for email: ${email}`); }
        this.logger.warn(`Invalid password for user: ${user.email}`);
        throw new BadRequestException('Invalid credentials. Please check your email and password.');
      }
      if (user.status !== 1) {
        await this.logService.createLogForUserAction(Number(user.id), 'users', Number(user.id), 'login_failed', `Attempted login from inactive user: ${email}`);
        this.logger.warn(`Login attempt from inactive user: ${user.email}`);
        throw new BadRequestException('Your account is not active. Please contact support for validation.');
      }
      this.logger.log(`User authenticated: ${user.email}`);
      const { password: _, ...result } = user;
      const payload = { email: user.email, sub: user.id.toString(), role_id: Number(user.role_id), company_id: user.company_id ? Number(user.company_id) : null };
      await this.logService.createLogForUserAction(Number(user.id), 'users', Number(user.id), 'login', `User logged in: ${user.email}`);
      const token = this.jwtService.sign(payload);
      this.logger.log(`JWT token created for user: ${user.email}`);
      const role = await this.prisma.client.roles.findFirst({ where: { id: Number(user.role_id) } });
      let providerProfile;
      if (role && role.id === BigInt(3)) { providerProfile = await this.providerService.getOneByUserId(Number(user.id)); }
      const status = await this.prisma.client.app_settings.findFirst({ where: { famille: 'user_status' } });
      this.logger.log(`Role and status fetched for user: ${user.email}`);
      return {
        token,
        providerProfile: providerProfile ? providerProfile : null,
        user: {
          id: user.id,
          firstname: user.firstname,
          midname: user.midname,
          lastname: user.lastname,
          avatar: user.avatar,
          phone: user.phone,
          username: user.username,
          email: user.email,
          email_verified: user.email_verified,
          last_login: user.last_login,
          role_id: user.role_id,
          role: role ? { id: role.id, title: role.title } : null,
          company_id: user.company_id,
          company: company ? {
            id: company.id,
            title: company.title,
            url: company.url,
            logo: company.logo,
            matricule: company.matricule,
            domain: company.domain,
            date_foundation: company.date_foundation,
            description: company.description,
            status: company.status
          } : null,
          status: user.status
        }
      };
    } catch (error) {
      this.logger.error('Error during login:', error.stack);
      throw error;
    }
  }

  async refreshToken(user: any) {
    const payload = { email: user.email, sub: user.id.toString(), role_id: Number(user.role_id), company_id: user.company_id ? Number(user.company_id) : null };
    const newToken = this.jwtService.sign(payload, { expiresIn: '60m' });
    const role = await this.prisma.client.roles.findFirst({ where: { id: Number(user.role_id) } });
    const status = await this.prisma.client.app_settings.findFirst({ where: { famille: 'user_status' } });
    return {
      token: newToken,
      user: {
        id: user.id,
        firstname: user.firstname,
        midname: user.midname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        phone: user.phone,
        last_login: user.last_login,
        status: user.status,
        role: role ? { id: role.id, title: role.title } : null,
        company_id: user.company_id || null,
      }
    };
  }

  async logout(userId: number) {
    try {
      if (userId === 1) { await this.userService.updateRootCompany(BigInt(userId)); }
      await this.prisma.client.users.update({ where: { id: Number(userId) }, data: { last_login: new Date() } });
      await this.logService.createLogForUserAction(Number(userId), 'users', userId, 'logout', `User logged out: ${userId}`);
      return { message: 'Logged out successfully' };
    } catch (error) { throw new BadRequestException('Error during logout'); }
  }
}