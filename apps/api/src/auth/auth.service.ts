import {Injectable} from '@nestjs/common';
import {UserService} from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    // Note: Use bcrypt in a real production application
    if (user && user.password === pass) {
      const {password, ...result} = user;
      return result;
    }
    return null;
  }

  async validateDiscordUser(profile: any): Promise<any> {
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

  async register(userData: any) {
    // Note: Hash password in a real production application
    const user = await this.userService.create(userData);
    const {password, ...result} = user;
    return result;
  }
}
