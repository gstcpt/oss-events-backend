import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) { }
  async create(createMessageDto: CreateMessageDto) {
    try {
      const { sender_id, source, ...rest } = createMessageDto;
      if (source === 'Contact' && !sender_id) { rest.status_for_sender = 1; }
      const data = { ...rest, sender_id: sender_id ? sender_id : null };
      return this.prisma.client.messages.create({ data });
    } catch (error) { throw new BadRequestException('Error sending message'); }
  }
  async saveDraftMessage(createMessageDto: CreateMessageDto, user: any) {
    const { receiver_id, subject, message, company_id, source, parent_message_id, email, name, phone } = createMessageDto;
    const data = {
      sender_id: user.id,
      receiver_id: receiver_id,
      subject: subject || '',
      message: message || '',
      status_for_sender: 0,
      status_for_receiver: 0,
      company_id: company_id,
      source: source || 'Internal',
      parent_message_id: parent_message_id || null,
      email: email || null,
      name: name || null,
      phone: phone || null
    };
    return this.prisma.client.messages.create({ data });
  }
  async draftToSend(id: number) {
    try {
      const messageDraftToSend = await this.prisma.client.messages.findUnique({ where: { id } });
      if (!messageDraftToSend) { throw new BadRequestException('Draft message not found'); }
      const updateData = { status_for_sender: 1 };
      return this.prisma.client.messages.update({ where: { id: messageDraftToSend.id }, data: updateData });
    } catch (error) { throw new BadRequestException('Error sending draft message'); }
  }
  async update(id: number, updateMessageDto: UpdateMessageDto) { try { return this.prisma.client.messages.update({ where: { id }, data: updateMessageDto }); } catch (error) { throw new BadRequestException('Error sending draft message'); } }
  async findAllMessages() { try { return this.prisma.client.messages.findMany(); } catch (error) { throw new BadRequestException('Error fetching all messages'); } }
  async countAllMessages() { try { return this.prisma.client.messages.count({}); } catch (error) { throw new BadRequestException('Error counting all messages'); } }
  async countAllMessagesByCompany(companyId: number) { try { return this.prisma.client.messages.count({ where: { company_id: companyId } }); } catch (error) { throw new BadRequestException('Error counting all messages by company'); } }
  async countReadMessagesByCompany(companyId: number) { try { return this.prisma.client.messages.count({ where: { company_id: companyId, status_for_receiver: 1 } }); } catch (error) { throw new BadRequestException('Error counting all read messages by company'); } }
  async countUnreadMessagesByCompany(companyId: number) { try { return this.prisma.client.messages.count({ where: { company_id: companyId, status_for_receiver: 0 } }); } catch (error) { throw new BadRequestException('Error counting all unread messages by company'); } }
  async countAllInternalMessagesByCompany(companyId: number) { try { return this.prisma.client.messages.count({ where: { company_id: companyId, source: 'Internal', status_for_receiver: 0 } }); } catch (error) { throw new BadRequestException('Error counting all internal messages by company'); } }
  async countAllContactFormMessagesByCompany(companyId: number) { try { return this.prisma.client.messages.count({ where: { company_id: companyId, source: 'Contact', status_for_receiver: 0 } }); } catch (error) { throw new BadRequestException('Error counting all contact messages by company'); } }
  async countAllInboxMessageByUser(userId: bigint) { try { return this.prisma.client.messages.count({ where: { receiver_id: userId, status_for_receiver: { in: [0, 1] }, status_for_sender: { not: 0 } } }); } catch (error) { throw new BadRequestException('Error counting all user messages'); } }
  async countAllInboxReadMessagesByUser(userId: bigint) { try { return this.prisma.client.messages.count({ where: { receiver_id: userId, status_for_receiver: 1 } }); } catch (error) { throw new BadRequestException('Error counting all read messages'); } }
  async countAllInboxUnreadMessagesByUser(userId: bigint) { try { return this.prisma.client.messages.count({ where: { receiver_id: userId, status_for_receiver: 0, status_for_sender: { not: 0 } } }); } catch (error) { throw new BadRequestException('Error counting all unread messages'); } }
  async countAllDraftMessageByUser(userId: bigint) { try { return this.prisma.client.messages.count({ where: { sender_id: userId, status_for_sender: 0 } }); } catch (error) { throw new BadRequestException('Error counting all user messages'); } }
  async countAllSentMessageByUser(userId: bigint) { try { return this.prisma.client.messages.count({ where: { sender_id: userId, status_for_sender: 1 } }); } catch (error) { throw new BadRequestException('Error counting all user messages'); } }
  async countAllTrashMessageByUser(userId: bigint) { try { return this.prisma.client.messages.count({ where: { OR: [{ receiver_id: userId, status_for_receiver: 2 }, { sender_id: userId, status_for_sender: 2 }, { sender_id: userId, status_for_sender: 3 }] } }); } catch (error) { throw new BadRequestException('Error counting all user messages'); } }
  async findMessageById(id: number) { try { return this.prisma.client.messages.findUnique({ where: { id } }); } catch (error) { throw new BadRequestException('No message found'); } }
  async findAllMessagesByCompany(companyId: number) { try { return this.prisma.client.messages.findMany({ where: { company_id: companyId }, orderBy: { id: 'desc' } }); } catch (error) { throw new BadRequestException('Error fetching all messages by company'); } }
  async findAllReadMessagesByCompany(companyId: number) { try { return this.prisma.client.messages.findMany({ where: { company_id: companyId, status_for_receiver: 1 }, orderBy: { id: 'desc' } }); } catch (error) { throw new BadRequestException('Error fetching all read messages by company'); } }
  async findAllUnreadMessagesByCompany(companyId: number) { try { return this.prisma.client.messages.findMany({ where: { company_id: companyId, status_for_receiver: 0 }, orderBy: { id: 'desc' } }); } catch (error) { throw new BadRequestException('Error fetching all unread messages by company'); } }
  async findAllInboxMessageByUser(userId: bigint) {
    try {
      const messages = await this.prisma.client.messages.findMany({ where: { receiver_id: userId, status_for_receiver: { in: [0, 1] }, status_for_sender: { not: 0 } }, orderBy: { id: 'desc' }, include: { sender: { select: { firstname: true, lastname: true, email: true } } } });
      return messages.map(message => {
        const sender = message.sender;
        return { ...message, name: sender ? `${sender.firstname} ${sender.lastname}` : message.name, email: sender ? sender.email : message.email, };
      });
    } catch (error) { throw new BadRequestException('Error fetching all user messages'); }
  }
  async findLast5InboxMessageByUser(userId: bigint) { try { return this.prisma.client.messages.findMany({ where: { receiver_id: userId, status_for_receiver: { in: [0, 1] }, status_for_sender: { not: 0 } }, orderBy: { id: 'desc' }, take: 5 }); } catch (error) { throw new BadRequestException('Error fetching all user messages'); } }
  async findAllInboxReadMessagesByUser(userId: bigint) { try { return this.prisma.client.messages.findMany({ where: { receiver_id: userId, status_for_receiver: 1 }, orderBy: { id: 'desc' }, take: 5 }); } catch (error) { throw new BadRequestException('Error fetching all read messages'); } }
  async findAllInboxUnreadMessagesByUser(userId: bigint) { try { return this.prisma.client.messages.findMany({ where: { receiver_id: userId, status_for_receiver: 0, status_for_sender: { not: 0 } }, orderBy: { id: 'desc' }, take: 5 }); } catch (error) { throw new BadRequestException('Error fetching all unread messages'); } }
  async findAllDraftMessageByUser(userId: bigint) {
    try {
      const messages = await this.prisma.client.messages.findMany({ where: { sender_id: userId, status_for_sender: 0 }, orderBy: { id: 'desc' }, include: { receiver: { select: { firstname: true, lastname: true, email: true } } } });
      return messages.map(message => {
        const receiver = message.receiver;
        return { ...message, name: receiver ? `${receiver.firstname} ${receiver.lastname}` : message.name, email: receiver ? receiver.email : message.email };
      });
    } catch (error) { throw new BadRequestException('Error fetching all user messages'); }
  }
  async findAllSentMessageByUser(userId: bigint) {
    try {
      const messages = await this.prisma.client.messages.findMany({ where: { sender_id: userId, status_for_sender: 1 }, orderBy: { id: 'desc' }, include: { receiver: { select: { firstname: true, lastname: true, email: true } } } });
      return messages.map(message => {
        const receiver = message.receiver;
        return { ...message, name: receiver ? `${receiver.firstname} ${receiver.lastname}` : message.name, email: receiver ? receiver.email : message.email };
      });
    } catch (error) { throw new BadRequestException('Error fetching all user messages'); }
  }
  async findAllTrashMessageByUser(userId: bigint) {
    try {
      const messages = await this.prisma.client.messages.findMany({
        where: { OR: [{ receiver_id: userId, status_for_receiver: 2 }, { sender_id: userId, status_for_sender: 2 }, { sender_id: userId, status_for_sender: 3 }] },
        orderBy: { id: 'desc' },
        include: { sender: { select: { firstname: true, lastname: true, email: true } }, receiver: { select: { firstname: true, lastname: true, email: true } } },
      });
      return messages.map(message => {
        if (message.sender_id === userId) {
          const receiver = message.receiver;
          return { ...message, type: 'sent', name: receiver ? `${receiver.firstname} ${receiver.lastname}` : message.name, email: receiver ? receiver.email : message.email };
        } else {
          const sender = message.sender;
          return { ...message, type: 'received', name: sender ? `${sender.firstname} ${sender.lastname}` : message.name, email: sender ? sender.email : message.email };
        }
      });
    } catch (error) { throw new BadRequestException('Error fetching all user messages'); }
  }
  async markAllInboxMessagesAsRead(userId: bigint) { try { return this.prisma.client.messages.updateMany({ where: { receiver_id: userId, status_for_receiver: 0 }, data: { status_for_receiver: 1 } }); } catch (error) { throw new BadRequestException('Error marking all messages as read'); } }
  async markAllInboxMessagesAsUnread(userId: bigint) { try { return this.prisma.client.messages.updateMany({ where: { receiver_id: userId, status_for_receiver: 1 }, data: { status_for_receiver: 0 } }); } catch (error) { throw new BadRequestException('Error marking all messages as unread'); } }
  async markMessageAsRead(id: number) { try { return this.prisma.client.messages.update({ where: { id }, data: { status_for_receiver: 1 } }); } catch (error) { throw new BadRequestException('Error marking message as read'); } }
  async markMessageAsUnread(id: number) { try { return this.prisma.client.messages.update({ where: { id }, data: { status_for_receiver: 0 } }); } catch (error) { throw new BadRequestException('Error marking message as unread'); } }
  async moveInboxMessageToTrash(id: number) { try { return this.prisma.client.messages.update({ where: { id }, data: { status_for_receiver: 2 } }); } catch (error) { throw new BadRequestException('Error moving inbox message to trash'); } }
  async moveDraftMessageToTrash(id: number) { try { return this.prisma.client.messages.update({ where: { id }, data: { status_for_sender: 2 } }); } catch (error) { throw new BadRequestException('Error moving draft message to trash'); } }
  async moveSentMessageToTrash(id: number) { try { return this.prisma.client.messages.update({ where: { id }, data: { status_for_sender: 3 } }); } catch (error) { throw new BadRequestException('Error moving sent message to trash'); } }
  async restoreMessageFromTrashToInbox(id: number) { try { return this.prisma.client.messages.update({ where: { id }, data: { status_for_receiver: 0 } }); } catch (error) { throw new BadRequestException('Error restoring message from trash'); } }
  async restoreMessageFromTrashToDraft(id: number) { try { return this.prisma.client.messages.update({ where: { id }, data: { status_for_sender: 0 } }); } catch (error) { throw new BadRequestException('Error restoring message from trash'); } }
  async restoreMessageFromTrashToSent(id: number) { try { return this.prisma.client.messages.update({ where: { id }, data: { status_for_sender: 1 } }); } catch (error) { throw new BadRequestException('Error restoring message from trash'); } }
  async getUsers(companyId?: bigint) {
    try {
      if (companyId && companyId !== BigInt(0)) { return this.prisma.client.users.findMany({ where: { status: 1, OR: [{ company_id: companyId }, { company_id: null }] }, orderBy: { firstname: 'asc' } }); }
      return this.prisma.client.users.findMany({ where: { status: 1 }, orderBy: { firstname: 'asc' } });
    } catch (error) { throw new BadRequestException('Error finding users by company'); }
  }
  async emptyTrash(userId: number) {
    try {
      if (userId === 0) { throw new BadRequestException('Invalid user ID'); }
      let messagesReceiverTrash = await this.prisma.client.messages.findMany({ where: { receiver_id: userId, status_for_receiver: { in: [2, 3] } } });
      let messagesSenderTrash = await this.prisma.client.messages.findMany({ where: { sender_id: userId, status_for_sender: { in: [2, 3] } } });
      if (messagesReceiverTrash.length > 0) { for (const message of messagesReceiverTrash) { await this.prisma.client.messages.update({ where: { id: message.id }, data: { status_for_receiver: 4 } }); } }
      if (messagesSenderTrash.length > 0) { for (const message of messagesSenderTrash) { await this.prisma.client.messages.update({ where: { id: message.id }, data: { status_for_sender: 4 } }); } }
    } catch (error) { throw new BadRequestException('Error emptying trash'); }
  }
}