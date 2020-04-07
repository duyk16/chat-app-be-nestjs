import {
  Controller,
  Post,
  UseGuards,
  Body,
  ValidationPipe,
  Get,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ConversationsService } from './conversations.service';
import { GetUser } from '../auth/getUser.decorator';
import { Payload } from '../auth/jwt.interface';
import { CreateConversationDto } from './conversation.dto';

@Controller('conversations')
@UseGuards(AuthGuard())
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post('/')
  createConversation(
    @GetUser() user: Payload,
    @Body(ValidationPipe) createConversationDto: CreateConversationDto,
  ) {
    return this.conversationsService.createConversation(
      user._id,
      createConversationDto,
    );
  }
}
