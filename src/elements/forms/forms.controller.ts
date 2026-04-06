import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { CreateFormsDto } from './dto/create-forms.dto';
import { UpdateFormsDto } from './dto/update-forms.dto';
import { FormsService } from './forms.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { User } from '../../common/decorators/user.decorator';


@ApiTags('Forms')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) { }

  @Post()
  @RequirePermissions('forms.create')
  create(@Body() createFormsDto: CreateFormsDto, @User() user: any) { return this.formsService.create(createFormsDto, user); }

  @Get()
  findAll(@User() user: any) { return this.formsService.findAll(user); }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: any) { return this.formsService.findOne(+id, user); }

  @Patch(':id')
  @RequirePermissions('forms.update')
  update(@Param('id') id: string, @Body() updateFormsDto: UpdateFormsDto, @User() user: any) { return this.formsService.update(+id, updateFormsDto, user); }

  @Delete(':id')
  @RequirePermissions('forms.delete')
  remove(@Param('id') id: string, @User() user: any) { return this.formsService.remove(+id, user); }
}