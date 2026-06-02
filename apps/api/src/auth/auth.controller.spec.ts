import {Response} from 'express';
import {Test, TestingModule} from '@nestjs/testing';

import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    isSuperAdmin: false,
  };

  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockUser),
            generateTokens: jest.fn().mockReturnValue({
              accessToken: 'mock-access',
              refreshToken: 'mock-refresh',
            }),
            verifyRefreshToken: jest.fn().mockReturnValue({
              email: 'test@example.com',
              sub: 1,
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return the user object from request', async () => {
      const mockReq: any = {user: mockUser};
      const result = await controller.login(mockReq, mockRes);
      expect(result).toEqual(mockUser);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'accessToken',
        'mock-access',
        expect.any(Object)
      );
    });
  });

  describe('discordAuthCallback', () => {
    it('should redirect after discord callback', async () => {
      const mockReq: any = {user: mockUser};
      await controller.discordAuthCallback(mockReq, mockRes);
      expect(mockRes.redirect).toHaveBeenCalledWith('http://localhost:5173');
    });
  });

  describe('me', () => {
    it('should return the user profile', () => {
      const mockReq: any = {user: mockUser};
      const result = controller.me(mockReq);
      expect(result).toBe(mockUser);
    });
  });
});
