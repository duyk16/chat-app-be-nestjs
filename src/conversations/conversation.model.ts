import { prop, arrayProp, Ref } from '@typegoose/typegoose';

import { BaseModel } from '../shared/base.model';
import { User } from '../users/user.model';

export class Conversation extends BaseModel {
  @arrayProp({ itemsRef: 'User' })
  members!: Ref<User>[];

  @prop({ default: new Date() })
  createdAt?: Date;
}
