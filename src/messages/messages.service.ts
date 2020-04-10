import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ReturnModelType } from '@typegoose/typegoose';

import { BaseService } from '../shared/base.service';
import { Message } from './message.model';
import { CreateMessageDto } from './message.dto';
import { ConversationsService } from '../conversations/conversations.service';
import { UsersService } from '../users/users.service';
import { Types } from 'mongoose';

@Injectable()
export class MessagesService extends BaseService<Message> {
  constructor(
    @InjectModel(Message.name)
    messageModel: ReturnModelType<typeof Message>,
    @Inject(forwardRef(() => ConversationsService))
    private conversationsService: ConversationsService,

    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {
    super(messageModel);
  }

  async createMessage(
    userId: string,
    createMessageDto: CreateMessageDto,
    image?: string,
  ) {
    let owerId = this.toObjectId(userId);
    let conversation = await this.conversationsService.findOne({
      _id: this.toObjectId(createMessageDto.conversation),
      members: owerId,
    });

    this.logger.log(
      `Start create message for conversation ID: ${JSON.stringify(
        conversation._id,
      )}`,
    );

    let message: Message = {
      content: createMessageDto.content,
      conversation: conversation._id,
      owner: owerId,
    };

    if (image) message.image = image;

    let result = await this.create(message);

    this.logger.log(`User ID: ${userId} create message success`);

    await Promise.all([
      conversation.members.map((userId: Types.ObjectId) =>
        this.usersService.updateById(userId, {
          $addToSet: { newMessageConversations: conversation._id },
        }),
      ),
    ]);

    return { _id: result._id };
  }
}
