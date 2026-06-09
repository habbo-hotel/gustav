import {Module, Global} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {User} from './entities/user.entity';
import {AppDataSource} from './data-source';
import {UserRepository} from './repositories/user.repository';
import {DynamicRecord} from './entities/dynamic-record.entity';
import {DynamicSchema} from './entities/dynamic-schema.entity';
import {ThemeSetting} from './entities/theme-setting.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    TypeOrmModule.forFeature([User, DynamicSchema, DynamicRecord, ThemeSetting]),
  ],
  providers: [UserRepository],
  exports: [TypeOrmModule, UserRepository],
})
export class DatabaseModule {}
