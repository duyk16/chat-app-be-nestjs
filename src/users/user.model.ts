import { prop, arrayProp, Ref } from '@typegoose/typegoose';

import { BaseModel } from '../shared/base.model';
import { Conversation } from '../conversations/conversation.model';

export class User extends BaseModel {
  @prop()
  displayName!: string;

  @prop({ unique: true })
  email!: string;

  @prop({ index: true })
  password!: string;

  @prop()
  refreshToken?: string;

  @arrayProp({ default: [], itemsRef: 'Conversation' })
  conversations!: Ref<Conversation>[];

  @arrayProp({ default: [], itemsRef: 'Conversation' })
  newMessageConversations!: Ref<Conversation>[];
}
