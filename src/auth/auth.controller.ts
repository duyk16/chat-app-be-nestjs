import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  Req,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignInDto, SignUpDto, GetAccessTokenDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-in')
  signIn(@Body(ValidationPipe) signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('/sign-up')
  signUp(@Body(ValidationPipe) signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('/access-token')
  test(@Body(ValidationPipe) getAccessTokenDto: GetAccessTokenDto) {
    return this.authService.getAccessToken(getAccessTokenDto);
  }
}
