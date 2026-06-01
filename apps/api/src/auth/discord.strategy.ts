import {Injectable} from '@nestjs/common';
import {Strategy} from 'passport-discord';
import {PassportStrategy} from '@nestjs/passport';

import {AuthService} from './auth.service';
import {User} from '../database/entities/user.entity';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.DISCORD_CLIENT_ID || 'id',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || 'secret',
      callbackURL:
        process.env.DISCORD_CALLBACK_URL ||
        'http://localhost:3000/api/auth/discord/callback',
      scope: ['identify', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string;
      username: string;
      email: string;
    }
  ): Promise<User> {
    return this.authService.validateDiscordUser(profile);
  }
}
