import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { UploadService, userAvatarMulterConfig } from '../../upload/upload.service';

@ApiTags('Users')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService, private readonly uploadService: UploadService) { }
  @Post()
  @RequirePermissions('users.create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  create(@Body() createUserDto: CreateUserDto, @Req() req: any) { return this.userService.create(createUserDto, req.user); }

  @Post('admins')
  @RequirePermissions('users.createAdmin')
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({ status: 201, description: 'Admin created successfully.' })
  createAdmin(@Body() body: any) {
    const { currentUser, ...createUserDto } = body;
    return this.userService.createAdmin(createUserDto, currentUser);
  }

  @Post('providers')
  @RequirePermissions('users.createProvider')
  @ApiOperation({ summary: 'Create a new provider' })
  @ApiResponse({ status: 201, description: 'Provider created successfully.' })
  createProvider(@Body() body: any) {
    const { currentUser, ...createUserDto } = body;
    return this.userService.createProvider(createUserDto, currentUser);
  }

  @Post('clients')
  @RequirePermissions('users.createClient')
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully.' })
  createClient(@Body() body: any) {
    const { currentUser, ...createUserDto } = body;
    return this.userService.createClient(createUserDto, currentUser);
  }

  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('avatar', userAvatarMulterConfig))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid file.' })
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) { throw new BadRequestException('No file uploaded'); }
    const uploadedFile = this.uploadService.uploadUserAvatar(file);
    await this.userService.update(BigInt(req.user.id), { avatar: uploadedFile.url } as any, req.user);
    return uploadedFile;
  }

  @Get('admins/list/:id')
  @ApiOperation({ summary: 'Get all admins based on current user authorization' })
  @ApiResponse({ status: 200, description: 'List of admins retrieved successfully.' })
  findAdmins(@Param('id') id: number) { return this.userService.findAdmins(id); }

  @Get('providers/list/:id')
  @ApiOperation({ summary: 'Get all providers based on current user authorization' })
  @ApiResponse({ status: 200, description: 'List of providers retrieved successfully.' })
  findProviders(@Param('id') id: number) { return this.userService.findProviders(id); }

  @Get('clients/list/:id')
  @ApiOperation({ summary: 'Get all clients based on current user authorization' })
  @ApiResponse({ status: 200, description: 'List of clients retrieved successfully.' })
  findClients(@Param('id') id: number) { return this.userService.findClients(id); }

  @Get('profile/me/:id')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  myProfile(@Param('id') id: number) { return this.userService.myProfile(id); }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all users by company' })
  @ApiResponse({ status: 200, description: 'List of users by company retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No users found for this company.' })
  findAllByCompany(@Param('companyId') companyId: string) {
    try {
      return this.userService.findAllByCompany(BigInt(companyId));
    } catch (e) {
      throw new BadRequestException('Invalid company ID');
    }
  }

  @Get('providers/listByCompany/:companyId')
  @ApiOperation({ summary: 'Get all providers based on company' })
  @ApiResponse({ status: 200, description: 'List of providers retrieved successfully.' })
  findProvidersByCompany(@Param('companyId') companyId: bigint) { return this.userService.findProvidersByCompany(companyId); }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: bigint) { return this.userService.findOne(id); }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully.' })
  findAll() { return this.userService.findAll(); }

  @Get(':role')
  @ApiOperation({ summary: 'Get all users by role' })
  @ApiResponse({ status: 200, description: 'List of users by role retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No users found for this role.' })
  findAllByRole(@Param('role') role: bigint) { return this.userService.findAllByRole(role); }

  @Get(':status')
  @ApiOperation({ summary: 'Get all users by status' })
  @ApiResponse({ status: 200, description: 'List of users by status retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No users found for this status.' })
  findAllByStatus(@Param('status') status: boolean) { return this.userService.findAllByStatus(status); }

  @Get(':role/:companyId')
  @ApiOperation({ summary: 'Get all users by role and company' })
  @ApiResponse({ status: 200, description: 'List of users by role and company retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No users found for this role and company.' })
  findAllUsersByRoleAndCompany(@Param('role') role: bigint, @Param('companyId') companyId: bigint) { return this.userService.findAllUsersByRoleAndCompany(role, companyId); }

  @Get(':status/:companyId')
  @ApiOperation({ summary: 'Get all users by status and company' })
  @ApiResponse({ status: 200, description: 'List of users by status and company retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No users found for this status and company.' })
  findAllUsersByStatusAndCompany(@Param('status') status: boolean, @Param('companyId') companyId: bigint) { return this.userService.findAllUsersByStatusAndCompany(status, companyId); }

  @Patch(':id/company')
  @RequirePermissions('users.company.update')
  @ApiOperation({ summary: 'Change user company' })
  @ApiResponse({ status: 200, description: 'User company updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  changeCompany(@Param('id') id: bigint, @Body('companyId') companyId: bigint) { return this.userService.changeCompany(id, companyId); }

  @Patch('admins/:id')
  @RequirePermissions('users.updateAdmin')
  @ApiOperation({ summary: 'Update admin by ID' })
  @ApiResponse({ status: 200, description: 'Admin updated successfully.' })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  updateAdmin(@Param('id') id: bigint, @Body() body: any) {
    const { currentUser, ...updateUserDto } = body;
    return this.userService.updateAdmin(id, updateUserDto, currentUser);
  }

  @Patch('providers/:id')
  @RequirePermissions('users.updateProvider')
  @ApiOperation({ summary: 'Update provider by ID' })
  @ApiResponse({ status: 200, description: 'Provider updated successfully.' })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  updateProvider(@Param('id') id: bigint, @Body() body: any) {
    const { currentUser, ...updateUserDto } = body;
    return this.userService.updateProvider(id, updateUserDto, currentUser);
  }

  @Patch('clients/:id')
  @RequirePermissions('users.updateClient')
  @ApiOperation({ summary: 'Update client by ID' })
  @ApiResponse({ status: 200, description: 'Client updated successfully.' })
  @ApiResponse({ status: 404, description: 'Client not found.' })
  updateClient(@Param('id') id: bigint, @Body() body: any) {
    const { currentUser, ...updateUserDto } = body;
    return this.userService.updateClient(id, updateUserDto, currentUser);
  }

  @Patch('profile/me')
  @RequirePermissions('users.updateMyProfile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  updateMyProfile(@Body() body: any) {
    const { currentUser, ...updateUserDto } = body;
    return this.userService.updateMyProfile(currentUser, updateUserDto);
  }

  @Patch(':id')
  @RequirePermissions('users.update')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  update(@Param('id') id: bigint, @Body() updateUserDto: UpdateUserDto, @Req() req: any) { return this.userService.update(id, updateUserDto, req.user); }

  @Delete(':id')
  @RequirePermissions('users.delete')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: bigint, @Req() req: any) { return this.userService.remove(id, req.user); }
}