import {JwtService} from '@nestjs/jwt';
import {Test, TestingModule} from '@nestjs/testing';

import {AuthService} from './auth.service';
import {UserService} from '../user/user.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-token'),
            verify: jest
              .fn()
              .mockReturnValue({email: 'test@example.com', sub: 1}),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
