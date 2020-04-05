import { buildSchema, prop } from '@typegoose/typegoose';

export class BaseModel {
  @prop()
  createdAt?: Date;

  @prop()
  updatedAt?: Date;

  static get schema() {
    return buildSchema(this, {
      timestamps: true,
    });
  }

  static get modelName() {
    return this.name;
  }
}
