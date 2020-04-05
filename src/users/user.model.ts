import { prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';

import { BaseModel } from '../shared/base.model';

export class User extends BaseModel {
  @prop()
  displayName!: string;

  @prop()
  email!: string;

  @prop({ index: true })
  password!: string;

  @prop({ default: [] })
  conversations!: Types.ObjectId[];

  @prop({ default: 0 })
  newMessageCount!: number;
}
