import {PassportSerializer} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {UserService} from '../user/user.service';
import {User} from '../database/entities/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: User, done: (err: Error | null, user: number) => void) {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  }

  async deserializeUser(
    userId: number,
    done: (err: Error | null, payload: User | null) => void
  ) {
    console.log('Deserializing user:', userId);
    try {
      const user = await this.userService.findOne(userId);
      console.log('User found during deserialization:', !!user);
      done(null, user);
    } catch (err) {
      console.error('Error during deserialization:', err);
      done(err instanceof Error ? err : new Error(String(err)), null);
    }
  }
}
