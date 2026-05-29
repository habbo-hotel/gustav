import {Controller, Get, Param} from '@nestjs/common';
import {UserService} from './user.service';
import {IsSuperAdmin} from '../auth/is-super-admin.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @IsSuperAdmin()
  @Get('admin-only')
  adminOnly() {
    return {message: 'Welcome, Super Admin!'};
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
}
