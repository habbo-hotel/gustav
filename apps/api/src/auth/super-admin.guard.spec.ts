import {ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {SuperAdminGuard} from './super-admin.guard';

describe('SuperAdminGuard', () => {
  let guard: SuperAdminGuard;

  beforeEach(() => {
    guard = new SuperAdminGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if user is super admin', () => {
    const context = createMockContext({isSuperAdmin: true});
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if user is not super admin', () => {
    const context = createMockContext({isSuperAdmin: false});
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user is missing', () => {
    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});

function createMockContext(user: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user,
      }),
    }),
  } as ExecutionContext;
}
