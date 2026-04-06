import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { LogService } from './services/log.service';
import { NotificationService } from './services/notification.service';
import { TenantService } from './services/tenant.service';
import { PrismaModule } from '../prisma/prisma.module';

import { InteractionsService } from './services/interactions.service';
import { CommentsService } from './services/comments.service';
import { PageViewService } from './services/pageview.service';
import { PageEventService } from './services/pageevent.service';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
    imports: [PrismaModule],
    providers: [
        EmailService,
        LogService,
        NotificationService,
        TenantService,
        InteractionsService,
        CommentsService,
        PageViewService,
        PageEventService,
        PermissionsGuard
    ],
    exports: [
        EmailService,
        LogService,
        NotificationService,
        TenantService,
        InteractionsService,
        CommentsService,
        PageViewService,
        PageEventService,
        PermissionsGuard
    ]
})
export class CommonModule { }