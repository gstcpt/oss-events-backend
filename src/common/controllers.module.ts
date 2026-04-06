import { Module } from '@nestjs/common';
import { CommonModule } from './common.module';
import { CommentsController } from './controllers/comments.controller';
import { InteractionsController } from './controllers/interactions.controller';

@Module({
    imports: [CommonModule],
    controllers: [CommentsController, InteractionsController],
})
export class CommonControllersModule { }
