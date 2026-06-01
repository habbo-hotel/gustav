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
    return this.userService.findAll() as any;
  }

  @IsSuperAdmin()
  @Post('create')
  async create(@Body() input: CreateUserInput): Promise<UserWire> {
    return this.userService.create(input) as any;
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
    return this.userService.findOne(+id) as any;
  }
}
