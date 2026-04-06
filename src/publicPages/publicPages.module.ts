import { Module } from '@nestjs/common'
import { PublicPageAboutModule } from './about/about.module'
import { PublicPageBlogsModule } from './blogs/blogs.module'
import { PublicPageCategoriesModule } from './categories/categories.module'
import { PublicPageContactModule } from './contact/contact.module'
import { PublicPageCreateEventsModule } from './createEvents/createEvents.module'
import { PublicPageFAQModule } from './faq/faq.module'
import { PublicPageHomeModule } from './home/home.module'
import { PublicPageItemsModule } from './items/items.module'
import { PublicPagePrivacyPolicyModule } from './privacy-policy/privacy-policy.module'
import { PublicPageProvidersModule } from './providers/providers.module'
import { PublicPageTermsConditionsModule } from './terms-conditions/terms-conditions.module'
import { AudianceModule } from './audiances/audiance.module'

@Module({
  imports: [
    PublicPageAboutModule,
    PublicPageBlogsModule,
    PublicPageCategoriesModule,
    PublicPageContactModule,
    PublicPageCreateEventsModule,
    PublicPageFAQModule,
    PublicPageHomeModule,
    PublicPageItemsModule,
    PublicPagePrivacyPolicyModule,
    PublicPageProvidersModule,
    PublicPageTermsConditionsModule,
    AudianceModule
  ],
})
export class PublicPageModule { }