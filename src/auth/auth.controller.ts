import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  register(@Body() registerDto: RegisterDto, @Req() req: Request) { return this.authService.register(registerDto, req); }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) { return this.authService.verifyEmail(verifyEmailDto.token); }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email resent' })
  async resendVerification(@Body() body: { email: string, origin: string }, @Req() req) { return this.authService.resendVerification(body.email, body.origin); }

  @Post('reset-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset token sent' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Req() req: Request) { return this.authService.resetPassword(resetPasswordDto.email, req); }

  @Post('new-password')
  @ApiOperation({ summary: 'Set new password' })
  @ApiResponse({ status: 200, description: 'Password updated' })
  newPassword(@Body() newPasswordDto: NewPasswordDto) { return this.authService.newPassword(newPasswordDto.token, newPasswordDto.newPassword); }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() loginDto: LoginDto) { return this.authService.login(loginDto); }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh user token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refresh(@Req() req: Request) { return this.authService.refreshToken(req.user); }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Req() req: Request) {return this.authService.logout(Number((req.user as any).id));}
}