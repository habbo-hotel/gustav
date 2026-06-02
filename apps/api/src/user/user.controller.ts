import {AdminStatsWire, UserWire, CreateUserInput} from '@gustav/types';
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

import {UserService} from './user.service';
import {IsSuperAdmin} from '../auth/is-super-admin.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @IsSuperAdmin()
  @Get('admin-stats')
  async getAdminStats(): Promise<AdminStatsWire> {
    const users = await this.userService.findAll();
    return {
      totalUsers: users.length,
      activeSessions: 1, // Placeholder
      systemHealth: 'Healthy',
    };
  }

  @IsSuperAdmin()
  @Get('list')
  async list(): Promise<UserWire[]> {
    const users = await this.userService.findAll();
    return users.map(user => this.userService.mapToWire(user));
  }

  @IsSuperAdmin()
  @Post('create')
  async create(@Body() input: CreateUserInput): Promise<UserWire> {
    const user = await this.userService.create(input);
    return this.userService.mapToWire(user);
  }

  @IsSuperAdmin()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.userService.delete(+id);
  }

  @IsSuperAdmin()
  @Post('reset-password/:id')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Param('id') id: string): Promise<void> {
    return this.userService.resetPassword(+id);
  }

  @Get('find/:id')
  async findOne(@Param('id') id: string): Promise<UserWire> {
    const user = await this.userService.findOne(+id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userService.mapToWire(user);
  }

  // Remove private mapToWire method as it's now in UserService
}
