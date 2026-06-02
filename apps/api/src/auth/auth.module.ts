import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';

import {AuthService} from './auth.service';
import {JwtStrategy} from './jwt.strategy';
import {UserModule} from '../user/user.module';
import {LocalStrategy} from './local.strategy';
import {AuthController} from './auth.controller';
import {DiscordStrategy} from './discord.strategy';
import {SuperAdminGuard} from './super-admin.guard';

@Module({
  imports: [
    UserModule,
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.register({
      secret: 'secretKey', // In production, use environment variable
      signOptions: {expiresIn: '15m'},
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    DiscordStrategy,
    SuperAdminGuard,
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
