import { Module } from '@nestjs/common';
import { AppSettingsModule } from './app-settings/app-settings.module';
import { LogModule } from './logs/log.module';
import { MessageModule } from './messages/message.module';
import { ModuleModule } from './modules/module.module';
import { NotificationModule } from './notifications/notification.module';
import { PackModule } from './packs/pack.module';
import { PermissionModule } from './permissions/permission.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { RoleModule } from './roles/role.module';
import { PackLineModule } from './packs/pack-lines/pack-line.module';
import { SubscriptionModule } from './subscriptions/subscription.module';
import { RaportModule } from './raports/raport.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LocationModule } from './locations/locations.module';
import { TermsConditionsModule } from './terms-conditions/terms-conditions.module';
import { NewsletterModule } from './newsletter/newsletter.module';

@Module({
  imports: [
    AppSettingsModule,
    LogModule,
    MessageModule,
    ModuleModule,
    NotificationModule,
    PackModule,
    PermissionModule,
    RolePermissionModule,
    RoleModule,
    PackLineModule,
    SubscriptionModule,
    RaportModule,
    DashboardModule,
    LocationModule,
    TermsConditionsModule,
    NewsletterModule,
  ],
})
export class DefaultsModule {}