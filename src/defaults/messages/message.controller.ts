import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { UserService } from '../../actors/users/user.service';


@ApiTags('Messages')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService, private readonly userService: UserService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({ status: 201, description: 'Message created successfully.' })
  create(@Body() createMessageDto: CreateMessageDto) { return this.messageService.create(createMessageDto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a message' })
  @ApiResponse({ status: 200, description: 'Message updated successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) { return this.messageService.update(+id, updateMessageDto); }

  @Get('users/company')
  @ApiOperation({ summary: 'Get all users of the same company' })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No users found for this company.' })
  findAllByCompany(@Req() req: any) {
    const user = req.user;
    return this.userService.findAllByCompany(user.company_id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all messages' })
  @ApiResponse({ status: 200, description: 'List of messages retrieved successfully.' })
  findAllMessages() { return this.messageService.findAllMessages(); }

  @Get('countAll')
  @ApiOperation({ summary: 'Get count of all messages' })
  @ApiResponse({ status: 200, description: 'Count of all messages retrieved successfully.' })
  countAllMessages() { return this.messageService.countAllMessages(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get message by ID' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  findMessageById(@Param('id') id: string) { return this.messageService.findMessageById(+id); }

  @Patch(':id/mark-as-read')
  @ApiOperation({ summary: 'Mark message as read by ID' })
  @ApiResponse({ status: 200, description: 'Message marked as read successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  markMessageAsRead(@Param('id') id: string) { return this.messageService.markMessageAsRead(+id); }

  @Patch(':id/mark-as-unread')
  @ApiOperation({ summary: 'Mark message as unread by ID' })
  @ApiResponse({ status: 200, description: 'Message marked as unread successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  markMessageAsUnread(@Param('id') id: string) { return this.messageService.markMessageAsUnread(+id); }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all messages for a company' })
  @ApiResponse({ status: 200, description: 'List of messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  findAllMessagesByCompany(@Param('companyId') companyId: string) { return this.messageService.findAllMessagesByCompany(+companyId); }

  @Get('company/:companyId/count-all')
  @ApiOperation({ summary: 'Get count of all messages for a company' })
  @ApiResponse({ status: 200, description: 'Count of all messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  countAllMessagesByCompany(@Param('companyId') companyId: string) { return this.messageService.countAllMessagesByCompany(+companyId); }

  @Get('company/:companyId/read-all')
  @ApiOperation({ summary: 'Get all read messages for a company' })
  @ApiResponse({ status: 200, description: 'List of messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  findAllReadMessagesByCompany(@Param('companyId') companyId: string) { return this.messageService.findAllReadMessagesByCompany(+companyId); }

  @Get('company/:companyId/count-read-all')
  @ApiOperation({ summary: 'Get count of all read messages for a company' })
  @ApiResponse({ status: 200, description: 'Count of all read messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  countReadMessagesByCompany(@Param('companyId') companyId: string) { return this.messageService.countReadMessagesByCompany(+companyId); }

  @Get('company/:companyId/unread-all')
  @ApiOperation({ summary: 'Get all unread messages for a company' })
  @ApiResponse({ status: 200, description: 'List of messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  findAllUnreadMessagesByCompany(@Param('companyId') companyId: string) { return this.messageService.findAllUnreadMessagesByCompany(+companyId); }

  @Get('company/:companyId/count-unread-all')
  @ApiOperation({ summary: 'Get count of all unread messages for a company' })
  @ApiResponse({ status: 200, description: 'Count of all unread messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  countUnreadMessagesByCompany(@Param('companyId') companyId: string) { return this.messageService.countUnreadMessagesByCompany(+companyId); }

  @Get('company/:companyId/count-all-internal')
  @ApiOperation({ summary: 'Get count of all internal messages for a company' })
  @ApiResponse({ status: 200, description: 'Count of all internal messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  countAllInternalMessagesByCompany(@Param('companyId') companyId: string) { return this.messageService.countAllInternalMessagesByCompany(+companyId); }

  @Get('company/:companyId/count-all-contact')
  @ApiOperation({ summary: 'Get count of all contact messages for a company' })
  @ApiResponse({ status: 200, description: 'Count of all contact messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  countAllContactFormMessagesByCompany(@Param('companyId') companyId: string) { return this.messageService.countAllContactFormMessagesByCompany(+companyId); }

  @Get('user/:userId/inbox')
  @ApiOperation({ summary: 'Get all messages for a user inbox' })
  @ApiResponse({ status: 200, description: 'List of messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findAllInboxMessageByUser(@Param('userId') userId: string) { return this.messageService.findAllInboxMessageByUser(BigInt(userId)); }

  @Get('user/:userId/count-all-inbox')
  @ApiOperation({ summary: 'Get count of all messages for a user inbox' })
  @ApiResponse({ status: 200, description: 'Count of all messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  countAllInboxMessageByUser(@Param('userId') userId: string) { return this.messageService.countAllInboxMessageByUser(BigInt(userId)); }

  @Get('user/:userId/last-5')
  @ApiOperation({ summary: 'Get last 5 messages for a user' })
  @ApiResponse({ status: 200, description: 'List of messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findLast5InboxMessageByUser(@Param('userId') userId: string) { return this.messageService.findLast5InboxMessageByUser(BigInt(userId)); }

  @Get('user/:userId/inbox-read')
  @ApiOperation({ summary: 'Get all read messages for a user inbox' })
  @ApiResponse({ status: 200, description: 'List of messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findAllInboxReadMessagesByUser(@Param('userId') userId: string) { return this.messageService.findAllInboxReadMessagesByUser(BigInt(userId)); }

  @Get('user/:userId/inbox-read-count')
  @ApiOperation({ summary: 'Get count of all read messages for a user inbox' })
  @ApiResponse({ status: 200, description: 'Count of all read messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  countAllInboxReadMessagesByUser(@Param('userId') userId: string) { return this.messageService.countAllInboxReadMessagesByUser(BigInt(userId)); }

  @Get('user/:userId/inbox-unread')
  @ApiOperation({ summary: 'Get all unread messages for a user inbox' })
  @ApiResponse({ status: 200, description: 'List of messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findAllInboxUnreadMessagesByUser(@Param('userId') userId: string) { return this.messageService.findAllInboxUnreadMessagesByUser(BigInt(userId)); }

  @Get('user/:userId/inbox-unread-count')
  @ApiOperation({ summary: 'Get count of all unread messages for a user inbox' })
  @ApiResponse({ status: 200, description: 'Count of all unread messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  countAllInboxUnreadMessagesByUser(@Param('userId') userId: string) { return this.messageService.countAllInboxUnreadMessagesByUser(BigInt(userId)); }

  @Patch('user/:userId/mark-all-inbox-as-read')
  @ApiOperation({ summary: 'Mark all messages in user inbox as read' })
  @ApiResponse({ status: 200, description: 'All messages in user inbox marked as read successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  markAllInboxMessagesAsRead(@Param('userId') userId: string) { return this.messageService.markAllInboxMessagesAsRead(BigInt(userId)); }

  @Patch('user/:userId/mark-all-inbox-as-unread')
  @ApiOperation({ summary: 'Mark all messages in user inbox as unread' })
  @ApiResponse({ status: 200, description: 'All messages in user inbox marked as unread successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  markAllInboxMessagesAsUnread(@Param('userId') userId: string) { return this.messageService.markAllInboxMessagesAsUnread(BigInt(userId)); }

  @Patch(':id/move-inbox-to-trash')
  @ApiOperation({ summary: 'Move inbox message to trash by ID' })
  @ApiResponse({ status: 200, description: 'Message moved to trash successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  moveInboxMessageToTrash(@Param('id') id: string) { return this.messageService.moveInboxMessageToTrash(+id); }

  @Post('draft')
  @ApiOperation({ summary: 'Save a message as a draft' })
  @ApiResponse({ status: 201, description: 'Draft saved successfully.' })
  saveDraftMessage(@Body() createMessageDto: CreateMessageDto, @Req() req: any) { return this.messageService.saveDraftMessage(createMessageDto, req.user); }

  @Get('user/:userId/draft')
  @ApiOperation({ summary: 'Get all draft messages for a user' })
  @ApiResponse({ status: 200, description: 'List of draft messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findAllDraftMessageByUser(@Param('userId') userId: string) { return this.messageService.findAllDraftMessageByUser(BigInt(userId)); }

  @Get('user/:userId/draft-count')
  @ApiOperation({ summary: 'Get count of all draft messages for a user' })
  @ApiResponse({ status: 200, description: 'Count of all draft messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  countAllDraftMessageByUser(@Param('userId') userId: string) { return this.messageService.countAllDraftMessageByUser(BigInt(userId)); }

  @Patch(':id/move-draft-to-trash')
  @ApiOperation({ summary: 'Move sent message to trash by ID' })
  @ApiResponse({ status: 200, description: 'Message moved to trash successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  moveDraftMessageToTrash(@Param('id') id: string) { return this.messageService.moveDraftMessageToTrash(+id); }

  @Get('user/:userId/sent')
  @ApiOperation({ summary: 'Get all sent messages for a user' })
  @ApiResponse({ status: 200, description: 'List of sent messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findAllSentMessageByUser(@Param('userId') userId: string) { return this.messageService.findAllSentMessageByUser(BigInt(userId)); }

  @Get('user/:userId/sent-count')
  @ApiOperation({ summary: 'Get count of all sent messages for a user' })
  @ApiResponse({ status: 200, description: 'Count of all sent messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  countAllSentMessageByUser(@Param('userId') userId: string) { return this.messageService.countAllSentMessageByUser(BigInt(userId)); }

  @Patch(':id/move-sent-to-trash')
  @ApiOperation({ summary: 'Move sent message to trash by ID' })
  @ApiResponse({ status: 200, description: 'Message moved to trash successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  moveSentMessageToTrash(@Param('id') id: string) { return this.messageService.moveSentMessageToTrash(+id); }

  @Get('user/:userId/trash')
  @ApiOperation({ summary: 'Get all trash messages for a user' })
  @ApiResponse({ status: 200, description: 'List of trash messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findAllTrashMessageByUser(@Param('userId') userId: string) { return this.messageService.findAllTrashMessageByUser(BigInt(userId)); }

  @Get('user/:userId/trash-count')
  @ApiOperation({ summary: 'Get count of all trash messages for a user' })
  @ApiResponse({ status: 200, description: 'Count of all trash messages retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  countAllTrashMessageByUser(@Param('userId') userId: string) { return this.messageService.countAllTrashMessageByUser(BigInt(userId)); }

  @Patch(':id/restore-from-trash-to-Inbox')
  @ApiOperation({ summary: 'Restore message from trash to inbox by ID' })
  @ApiResponse({ status: 200, description: 'Message restored from trash to inbox successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  restoreMessageFromTrashToInbox(@Param('id') id: string) { return this.messageService.restoreMessageFromTrashToInbox(+id); }

  @Patch(':id/restore-from-trash-to-Draft')
  @ApiOperation({ summary: 'Restore message from trash to draft by ID' })
  @ApiResponse({ status: 200, description: 'Message restored from trash to draft successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  restoreMessageFromTrashToDraft(@Param('id') id: string) { return this.messageService.restoreMessageFromTrashToDraft(+id); }

  @Patch(':id/restore-from-trash-to-Sent')
  @ApiOperation({ summary: 'Restore message from trash to sent by ID' })
  @ApiResponse({ status: 200, description: 'Message restored from trash to sent successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  restoreMessageFromTrashToSent(@Param('id') id: string) { return this.messageService.restoreMessageFromTrashToSent(+id); }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all users by company' })
  @ApiResponse({ status: 200, description: 'List of users by company retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No users found for this company.' })
  getUsers(@Param('companyId') companyId: string) { return this.messageService.getUsers(BigInt(companyId)); }

  @Patch(':id/draft-to-send')
  @ApiOperation({ summary: 'Send a draft message' })
  @ApiResponse({ status: 200, description: 'Message sent successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  draftToSend(@Param('id') id: number) { return this.messageService.draftToSend(id); }

  @Patch('empty-trash/:id')
  @ApiOperation({ summary: 'Empty trash for a user' })
  @ApiResponse({ status: 200, description: 'Trash emptied successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  emptyTrash(@Param('userId') userId: number) { return this.messageService.emptyTrash(userId); }
}