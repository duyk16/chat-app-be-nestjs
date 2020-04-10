import {
  Controller,
  Post,
  UseGuards,
  Body,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { MessagesService } from './messages.service';
import { GetUser } from '../auth/getUser.decorator';
import { Payload } from '../auth/jwt.interface';
import { CreateMessageDto } from './message.dto';

import { multerSingleUpload } from '../utils/uploader';

@Controller('messages')
@UseGuards(AuthGuard())
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('/')
  createMessage(
    @GetUser() user: Payload,
    @Body(ValidationPipe) createMessageDto: CreateMessageDto,
  ) {
    return this.messagesService.createMessage(user._id, createMessageDto);
  }

  @Post('/images')
  @UseInterceptors(multerSingleUpload('image'))
  async createMessageWithImage(
    @GetUser() user: Payload,
    @Body(ValidationPipe) createMessageDto: CreateMessageDto,
    @UploadedFile() file,
  ) {
    return this.messagesService.createMessage(
      user._id,
      createMessageDto,
      file.filename,
    );
  }
}
