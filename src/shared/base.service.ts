import {
  InternalServerErrorException,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';

import { BaseModel } from './base.model';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';

export class BaseService<T extends BaseModel> {
  protected logger: Logger;
  protected model: ReturnModelType<AnyParamConstructor<T>>;

  protected constructor(model: ReturnModelType<AnyParamConstructor<T>>) {
    this.model = model;
    this.logger = new Logger(model.modelName + 'Service');
  }

  public async getAll(filter = {}) {
    try {
      return await this.model.find(filter);
    } catch (error) {
      this.logger.error(
        `Failed to get all ${this.model.name}. Filter:`,
        JSON.stringify(filter),
      );

      throw error;
    }
  }

  public async getById(id: string) {
    try {
      const found = await this.model.findById(id);
      if (!found) throw new NotFoundException(`Not found with Id: ${id}`);
      return found;
    } catch (error) {
      this.logger.error(
        `Failed to get by Id. Data: ${JSON.stringify(
          id,
        )}. Error: ${JSON.stringify(error)}`,
      );

      throw error;
    }
  }

  public async create(doc: T) {
    try {
      console.log(this.model.create)
      return await this.model.create(doc);
    } catch (error) {
      this.logger.error(`Failed to create user. Data: ${JSON.stringify(doc)}`);
      throw error;
    }
  }
}
