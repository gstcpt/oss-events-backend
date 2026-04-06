import { Module } from '@nestjs/common';
import { CategoryModule } from './categories/category.module';
import { CategoryTagModule } from './categories/category-tags/category-tag.module';
import { EventModule } from './events/event.module';
import { EventLineModule } from './events/event-lines/event-line.module';
import { InteractionModule } from './interactions/interaction.module';
import { ItemCategoryModule } from './item-categories/item-category.module';
import { ItemMediaModule } from './item-media/item-media.module';
import { ItemOccupationModule } from './item-occupations/item-occupation.module';
import { ItemModule } from './items/item.module';
import { TagModule } from './tags/tag.module';
import { TagOptionModule } from './tags/tag-options/tag-option.module';
import { FormsModule } from './forms/forms.module';
import { BlogModule } from './blogs/blog.module';
import { FAQModule } from './faq/faq.module';
import { PrivacyPolicyModule } from './private-policy/privacy-policy.module';
import { FaqSectionsModule } from './faq-sections/faq-sections.module';

@Module({
  imports: [
    CategoryModule,
    CategoryTagModule,
    EventModule,
    EventLineModule,
    InteractionModule,
    ItemCategoryModule,
    ItemMediaModule,
    ItemOccupationModule,
    ItemModule,
    TagModule,
    TagOptionModule,
    FormsModule,
    BlogModule,
    FAQModule,
    PrivacyPolicyModule,
    FaqSectionsModule
  ],
})
export class ElementsModule { }