import {Injectable} from '@nestjs/common';
import {RegisterInput, UserWire} from '@gustav/types';

import {UserService} from '../user/user.service';
import {User} from '../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validateUser(email: string, pass: string): Promise<UserWire | null> {
    const user = await this.userService.findByEmail(email, true);
    // Note: Use bcrypt in a real production application
    if (user && user.password === pass) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {password, ...result} = user;
      return result as UserWire;
    }
    return null;
  }

  async validateDiscordUser(profile: {
    id: string;
    username: string;
    email: string;
  }): Promise<User> {
    let user = await this.userService.findByDiscordId(profile.id);
    if (!user) {
      user = await this.userService.create({
        discordId: profile.id,
        username: profile.username,
        email: profile.email,
      });
    }
    return user;
  }

  async register(userData: RegisterInput): Promise<UserWire> {
    // Note: Hash password in a real production application
    const user = await this.userService.create(userData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password, ...result} = user;
    return result as UserWire;
  }
}
