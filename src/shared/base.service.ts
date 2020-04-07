import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import { MongoError } from 'mongodb';

import { BaseModel } from './base.model';

export class BaseService<T extends BaseModel> {
  protected logger: Logger;
  protected model: ReturnModelType<AnyParamConstructor<T>>;

  protected constructor(model: ReturnModelType<AnyParamConstructor<T>>) {
    this.model = model;
    this.logger = new Logger(model.modelName + 'Service');
  }

  toObjectId(id: string) {
    try {
      return Types.ObjectId(id);
    } catch (error) {
      throw new BadRequestException(`ID is not valid`);
    }
  }

  handleMongoException(error: Error) {
    if (error instanceof MongoError) {
      switch (error.code) {
        case 11000:
          throw new ConflictException(error.message);
        default:
          this.logger.error(
            `MongoError at model ${this.model.name}`,
            JSON.stringify(error),
          );
          throw new InternalServerErrorException();
      }
    }

    throw error;
  }

  public async getAll(filter = {}) {
    try {
      return await this.model.find(filter);
    } catch (error) {
      this.logger.log(
        `Failed to get all ${this.model.name}. Filter: ${JSON.stringify(
          filter,
        )}`,
      );

      this.handleMongoException(error);
    }
  }

  public async getById(id: string, projection = {}) {
    try {
      const found = await this.model.findById(this.toObjectId(id), projection);
      if (!found) {
        this.logger.log(`Failed to get by Id. Data: ${JSON.stringify(id)}`);
        throw new NotFoundException(`Not found with Id: ${id}`);
      }
      return found;
    } catch (error) {
      this.handleMongoException(error);
    }
  }

  public async findOne(
    filter = {},
    projection: { [key in keyof T]?: number } = {},
  ) {
    try {
      const found = await this.model.findOne(filter, projection);
      if (!found) {
        this.logger.log(
          `Failed to find one. Filter: ${JSON.stringify(filter)}`,
        );

        throw new NotFoundException(
          `Not found with Filter: ${JSON.stringify(filter)}`,
        );
      }

      return found;
    } catch (error) {
      this.handleMongoException(error);
    }
  }

  public async create(doc: T) {
    try {
      let model = new this.model(doc);
      let result = await model.save();
      return result;
    } catch (error) {
      this.logger.log(`Failed to create. Data: ${JSON.stringify(doc)}`);
      this.handleMongoException(error);
    }
  }

  public async updateById(id: string, update: any) {
    try {
      return await this.model.findByIdAndUpdate(this.toObjectId(id), update);
    } catch (error) {
      this.logger.log(
        `Failed to update ${id}. Data: ${JSON.stringify(update)}`,
      );
      this.handleMongoException(error);
    }
  }

  public async deleteById(id: string) {
    try {
      return await this.model.findByIdAndRemove(id);
    } catch (error) {
      this.logger.log(`Fail to delete user by Id. Data: ${JSON.stringify(id)}`);
      this.handleMongoException(error);
    }
  }
}
