import {Module} from '@nestjs/common';

import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {PageModule} from './page/page.module';
import {HealthModule} from './health/health.module';
import {DatabaseModule} from './database/database.module';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, PageModule, HealthModule],
})
export class AppModule {}
