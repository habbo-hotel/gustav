import {AuthGuard} from '@nestjs/passport';
import {applyDecorators, UseGuards} from '@nestjs/common';

import {SuperAdminGuard} from './super-admin.guard';

export function IsSuperAdmin() {
  return applyDecorators(UseGuards(AuthGuard('jwt'), SuperAdminGuard));
}
