import {
  Injectable,
  NotFoundException,
  Inject,
  ConflictException,
  Type,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';

import { BaseService } from '../shared/base.service';
import { Conversation } from './conversation.model';
import { CreateConversationDto } from './conversation.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.model';
import { Types } from 'mongoose';

@Injectable()
export class ConversationsService extends BaseService<Conversation> {
  constructor(
    @InjectModel(Conversation.name)
    conversationModel: ReturnModelType<typeof Conversation>,
    @Inject(UsersService)
    private usersService: UsersService,
  ) {
    super(conversationModel);
  }

  async createConversation(
    userId: string,
    createConversationDto: CreateConversationDto,
  ) {
    const members = [
      this.toObjectId(userId),
      ...createConversationDto.members.map(item => this.toObjectId(item)),
    ];

    const found = await this.model.findOne({
      members: members,
    });

    if (found) {
      throw new ConflictException(
        `Conversation of there user was create before`,
      );
    }

    let users: DocumentType<User>[];

    try {
      users = await Promise.all(
        members.map(item => this.usersService.getById(item)),
      );
    } catch (error) {
      this.logger.log(
        `Failed to get members by Id. Data: ${JSON.stringify(
          createConversationDto,
        )}`,
      );
      throw new NotFoundException(`Failed to get members by Id`);
    }

    const conversation: Conversation = { members: users };

    const doc = await this.create(conversation);

    const updatedUsers = await Promise.all(
      users.map(user =>
        this.usersService.updateById(user._id, {
          $addToSet: {
            conversations: doc._id,
            newMessageConversations: doc._id,
          },
        }),
      ),
    );

    return { _id: doc._id, createdAt: doc.createdAt };
  }

  async getUserConversations(userId: string) {
    return await this.usersService.getById(userId, {
      conversations: 1,
      newMessageConversations: 1,
    });
  }

  async deleteConversation(id: string, userId: string) {
    const conversation = await this.deleteOne({
      _id: this.toObjectId(id),
      members: this.toObjectId(userId),
    });

    conversation.members.map(user =>
      this.usersService.updateById(user as Types.ObjectId, {
        $pull: {
          conversations: conversation._id,
          newMessageConversations: conversation._id,
        },
      }),
    );

    return { status: 'ok', members: conversation.members };
  }
}
