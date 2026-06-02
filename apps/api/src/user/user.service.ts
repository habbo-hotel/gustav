import sgMail from '@sendgrid/mail';
import {UserWire} from '@gustav/types';
import {Injectable, NotFoundException} from '@nestjs/common';

import {User} from '../database/entities/user.entity';
import {UserRepository} from '../database/repositories/user.repository';
import {
  SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL,
  SENDGRID_RESET_PASSWORD_TEMPLATE_ID,
  FRONTEND_URL,
} from '../environment';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {
    sgMail.setApiKey(SENDGRID_API_KEY);
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findOneWire(id: number): Promise<UserWire | null> {
    const user = await this.findOne(id);
    return user ? this.mapToWire(user) : null;
  }

  mapToWire(user: User): UserWire {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isSuperAdmin: user.isSuperAdmin,
      createdAt: user.createdAt,
    };
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
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

  async delete(id: number): Promise<void> {
    await this.userRepository.deleteOne(id);
  }

  async resetPassword(userId: number): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real app, you'd generate a secure token and save it
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const msg = {
      to: user.email,
      from: SENDGRID_FROM_EMAIL,
      templateId: SENDGRID_RESET_PASSWORD_TEMPLATE_ID,
      dynamicTemplateData: {
        userFirstName: user.firstName || user.username,
        userLastName: user.lastName || '',
        passwordResetLink: resetLink,
      },
    };

    await sgMail.send(msg);
  }
}
