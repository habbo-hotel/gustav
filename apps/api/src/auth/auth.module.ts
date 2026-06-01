import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';

import {AuthService} from './auth.service';
import {UserModule} from '../user/user.module';
import {LocalStrategy} from './local.strategy';
import {AuthController} from './auth.controller';
import {DiscordStrategy} from './discord.strategy';
import {SuperAdminGuard} from './super-admin.guard';
import {SessionSerializer} from './session.serializer';

@Module({
  imports: [UserModule, PassportModule.register({session: true})],
  providers: [
    AuthService,
    LocalStrategy,
    DiscordStrategy,
    SuperAdminGuard,
    SessionSerializer,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
