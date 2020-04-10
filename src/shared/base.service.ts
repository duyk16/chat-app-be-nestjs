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
import { PaginationDto } from './general.interface';

type TProjection<T> = { [key in keyof T]?: number };

export class BaseService<T extends BaseModel> {
  protected logger: Logger;
  protected model: ReturnModelType<AnyParamConstructor<T>>;

  protected constructor(model: ReturnModelType<AnyParamConstructor<T>>) {
    this.model = model;
    this.logger = new Logger(model.modelName + 'Service');
  }

  toObjectId(id: string | Types.ObjectId) {
    if (typeof id !== 'string') return id;
    try {
      return new Types.ObjectId(id);
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

  public async find(filter = {}, projection?: TProjection<T>, options?: any) {
    try {
      return await this.model.find(filter, projection, options);
    } catch (error) {
      this.logger.log(
        `Failed to get all ${this.model.name}. Filter: ${JSON.stringify(
          filter,
        )}`,
      );

      this.handleMongoException(error);
    }
  }

  public async findWithPagination(
    filter = {},
    pagination: PaginationDto = {},
    projection?: TProjection<T>,
    options?: any,
  ) {
    try {
      let { page = 0, limit = 10 } = pagination;
      const [count, docs] = await Promise.all([
        this.model.find(filter).countDocuments(),
        this.model
          .find(filter, projection, options)
          .skip(page * limit)
          .limit(limit),
      ]);

      return {
        data: docs,
        page: page,
        limit: limit,
        endPage: Math.floor(count / limit),
      };
    } catch (error) {}
  }

  public async findById(
    id: string | Types.ObjectId,
    projection?: TProjection<T>,
  ) {
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

  public async findOne(filter = {}, projection?: TProjection<T>) {
    try {
      const found = await this.model.findOne(filter, projection);
      if (!found) {
        this.logger.log(
          `Failed to find one. Filter: ${JSON.stringify(filter)}`,
        );

        throw new NotFoundException(`Not found`);
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

  public async updateById(id: string | Types.ObjectId, update: any) {
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
      let found = await this.model.findByIdAndRemove(id);
      if (!found) {
        this.logger.log(`Failed to delete by Id. Id: ${JSON.stringify(id)}`);

        throw new NotFoundException(`Not found`);
      }
      return found;
    } catch (error) {
      this.logger.log(`Fail to delete by Id. Data: ${JSON.stringify(id)}`);
      this.handleMongoException(error);
    }
  }

  public async deleteOne(filter = {}) {
    try {
      let found = await this.model.findOneAndDelete(filter);
      if (!found) {
        this.logger.log(
          `Failed to delete one. Filter: ${JSON.stringify(filter)}`,
        );

        throw new NotFoundException(`Not found`);
      }
      return found;
    } catch (error) {
      this.logger.log(`Fail to delete. Filter: ${JSON.stringify(filter)}`);
      this.handleMongoException(error);
    }
  }
}
