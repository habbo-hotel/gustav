import {Request} from 'express';
import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';

import {UserService} from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: 'secretKey', // In production, use environment variable
    });
  }

  async validate(payload: any) {
    // The payload contains the decoded JWT
    const user = await this.userService.findByEmail(payload.email, false);
    if (!user) {
      return null;
    }
    return this.userService.mapToWire(user);
  }
}
