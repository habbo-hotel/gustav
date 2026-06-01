import {Controller, Get, Param} from '@nestjs/common';
import {UserService} from './user.service';
import {IsSuperAdmin} from '../auth/is-super-admin.decorator';
import {AdminStatsWire, UserWire} from '@gustav/types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @IsSuperAdmin()
  @Get('admin-stats')
  async getAdminStats(): Promise<AdminStatsWire> {
    return {
      totalUsers: 1, // Placeholder for actual logic
      activeSessions: 1,
      systemHealth: 'Healthy',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserWire> {
    return this.userService.findOne(+id) as any;
  }
}
