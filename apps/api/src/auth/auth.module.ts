import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {UserModule} from '../user/user.module';
import {AuthService} from './auth.service';
import {LocalStrategy} from './local.strategy';
import {DiscordStrategy} from './discord.strategy';
import {AuthController} from './auth.controller';
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
