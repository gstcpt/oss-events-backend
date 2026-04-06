import { Controller, Put, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from '../services/comments.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Comments')
@Controller('comments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Put(':id')
    @ApiOperation({ summary: 'Update a comment' })
    @ApiResponse({ status: 200, description: 'Comment updated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not comment owner' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    async updateComment(@Param('id') id: string, @Body() body: { content: string }, @Req() req: any) {
        const isAdmin = Number(req.user.role_id) === 1 || Number(req.user.role_id) === 2;
        return this.commentsService.updateComment(Number(id), Number(req.user.id), { content: body.content }, isAdmin);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Partially update a comment (e.g. soft delete)' })
    @ApiResponse({ status: 200, description: 'Comment patched successfully' })
    async patchComment(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const isAdmin = Number(req.user.role_id) === 1 || Number(req.user.role_id) === 2;
        return this.commentsService.patchComment(Number(id), Number(req.user.id), body, isAdmin);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a comment' })
    @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not comment owner' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    async deleteComment(@Param('id') id: string, @Req() req: any) {
        const roleId = Number(req.user.role_id);
        return this.commentsService.deleteComment(Number(id), Number(req.user.id), roleId);
    }
}