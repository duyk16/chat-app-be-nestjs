import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as Bcrypt from 'bcrypt';

import { SignUpDto, SignInDto, GetAccessTokenDto } from './auth.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/user.dto';
import { Payload } from './jwt.interface';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const createUserDto: CreateUserDto = {
        email: signUpDto.email,
        password: signUpDto.password,
        displayName: signUpDto.displayName,
      };

      return await this.usersService.createUser(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(`Email was registered before`);
      }
    }
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findOne({
      email: signInDto.email,
    });

    const valid = await Bcrypt.compare(signInDto.password, user.password);

    if (!valid) {
      this.logger.log(`Failed to sign in. Data: ${JSON.stringify(signInDto)}`);
      throw new UnauthorizedException(`Password is not valid`);
    }

    const payload = { _id: user._id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE || '1d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE || '7d',
    });

    await this.usersService.updateById(user._id, { refreshToken });

    return {
      accessToken,
      refreshToken,
    };
  }

  async getAccessToken({ refreshToken }: GetAccessTokenDto) {
    try {
      const payload = (await this.jwtService.verifyAsync(
        refreshToken,
      )) as Payload;

      const user = await this.usersService.findById(payload._id, {
        refreshToken: 1,
      });

      if (!user) {
        this.logger.log(`Not found user to validate refresh token`);
        throw new Error(`Not found user to validate refresh token`);
      }

      const accessToken = await this.jwtService.signAsync(
        { _id: user._id, email: payload.email },
        { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE || '1d' },
      );

      return { accessToken };
    } catch (error) {
      this.logger.log(
        `Failed to validate refresh token. Data: ${JSON.stringify(
          refreshToken,
        )}`,
      );
      throw new BadRequestException(
        `Failed to validate refresh token. Please login again`,
      );
    }
  }
}
