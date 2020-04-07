import {
  IsEmail,
  Matches,
  IsNotEmpty,
  IsString,
  MinLength,
  IsJWT,
} from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  displayName: string;
}

export class SignInDto {
  @IsEmail()
  email: string;

  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is not correct',
  })
  password: string;
}

export class GetAccessTokenDto {
  @IsNotEmpty()
  @IsString()
  @IsJWT()
  refreshToken: string;
}
