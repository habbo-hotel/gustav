import {Test, TestingModule} from '@nestjs/testing';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser = {
    id: 1,
    username: 'testuser',
    isSuperAdmin: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockUser),
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
      const result = await controller.login({user: mockUser});
      expect(result).toEqual(mockUser);
    });
  });

  describe('discordAuthCallback', () => {
    it('should return the user object after discord callback', async () => {
      const result = await controller.discordAuthCallback({user: mockUser});
      expect(result).toEqual(mockUser);
    });
  });

  describe('me', () => {
    it('should return the user profile', () => {
      const result = controller.me({user: mockUser});
      expect(result).toBe(mockUser);
    });
  });
});
