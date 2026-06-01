import {Module} from '@nestjs/common';

import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {HealthModule} from './health/health.module';
import {DatabaseModule} from './database/database.module';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, HealthModule],
})
export class AppModule {}
