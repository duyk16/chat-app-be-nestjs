import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { Payload } from './jwt.interface';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'CHAT_APP',
    });
  }

  async validate(payload: Payload) {
    const { email } = payload;
    return { email };
  }
}
