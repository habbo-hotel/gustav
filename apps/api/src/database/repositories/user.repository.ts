import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {BaseRepository} from './base.repository';
import {User} from '../entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource);
  }

  async findByEmail(
    email: string,
    includePassword = false
  ): Promise<User | null> {
    return this.findOne({
      where: {email},
      select: includePassword
        ? ['id', 'username', 'email', 'password', 'isSuperAdmin', 'discordId']
        : undefined,
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({where: {username}});
  }

  async findByDiscordId(discordId: string): Promise<User | null> {
    return this.findOne({where: {discordId}});
  }
}
