import { prop, Ref } from '@typegoose/typegoose';

import { BaseModel } from '../shared/base.model';
import { Conversation } from '../conversations/conversation.model';
import { User } from '../users/user.model';

export class Message extends BaseModel {
  @prop({ maxlength: 1024 })
  content?: string;

  @prop({ ref: 'Conversation', index: true })
  conversation: Ref<Conversation>;

  @prop({ ref: 'User' })
  owner: Ref<User>;

  @prop()
  image?: string;
}
