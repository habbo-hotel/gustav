import {applyDecorators, UseGuards} from '@nestjs/common';

import {SuperAdminGuard} from './super-admin.guard';

export function IsSuperAdmin() {
  return applyDecorators(UseGuards(SuperAdminGuard));
}
