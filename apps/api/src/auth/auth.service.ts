import {Injectable} from '@nestjs/common';
import {RegisterInput, UserWire} from '@gustav/types';

import {UserService} from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validateUser(email: string, pass: string): Promise<UserWire | null> {
    const user = await this.userService.findByEmail(email, true);
    // Note: Use bcrypt in a real production application
    if (user && user.password === pass) {
      return this.userService.mapToWire(user);
    }
    return null;
  }

  async validateDiscordUser(profile: {
    id: string;
    username: string;
    email: string;
  }): Promise<UserWire> {
    let user = await this.userService.findByDiscordId(profile.id);
    if (!user) {
      user = await this.userService.create({
        discordId: profile.id,
        username: profile.username,
        email: profile.email,
      });
    }
    return this.userService.mapToWire(user);
  }

  async register(userData: RegisterInput): Promise<UserWire> {
    // Note: Hash password in a real production application
    const user = await this.userService.create(userData);
    return this.userService.mapToWire(user);
  }

  // Remove private mapToWire method as it's now in UserService
}
