import {Injectable} from '@nestjs/common';
import {UserRepository} from '../database/repositories/user.repository';
import {User} from '../database/entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(
    email: string,
    includePassword = false
  ): Promise<User | null> {
    return this.userRepository.findByEmail(email, includePassword);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async findByDiscordId(discordId: string): Promise<User | null> {
    return this.userRepository.findByDiscordId(discordId);
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
}
