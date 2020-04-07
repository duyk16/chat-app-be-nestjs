import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { getModelForClass } from '@typegoose/typegoose';

import { UsersService } from './users.service';
import { CreateUserDto } from './user.dto';
import { User } from './user.model';
import { UsersController } from './users.controller';
import { InternalServerErrorException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: getModelForClass(User),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // const createUserDto: CreateUserDto = {
  //   email: 'tester01@gmail.com',
  //   password: '123456',
  //   displayName: 'Tester 01',
  // };

  // it('Create user success', async () => {
  //   const mock = { _id: 'testId', createdAt: new Date() };
  //   jest.spyOn(service, 'createUser').mockResolvedValue(mock);

  //   expect(service.createUser).not.toHaveBeenCalled();
  //   const result = await controller.createUser(createUserDto);

  //   expect(result).toBeDefined();
  //   expect(result._id).toEqual(mock._id);
  //   expect(result.createdAt).toEqual(mock.createdAt);
  //   expect(service.createUser).toBeCalled();

  //   jest.spyOn(service, 'createUser').mockClear();
  // });

  // it('Create user error', async () => {
  //   try {
  //     jest
  //       .spyOn(service, 'createUser')
  //       .mockRejectedValue(new InternalServerErrorException());

  //     expect(service.createUser).not.toHaveBeenCalled();
  //     await controller.createUser(createUserDto);
  //   } catch (error) {
  //     expect(error).toBeDefined();
  //     expect(error instanceof InternalServerErrorException).toBeTruthy();
  //     jest.spyOn(service, 'createUser').mockClear();
  //   }
  // });
});
