import {Module, Global} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {User} from './entities/user.entity';
import {AppDataSource} from './data-source';
import {UserRepository} from './repositories/user.repository';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserRepository],
  exports: [TypeOrmModule, UserRepository],
})
export class DatabaseModule {}
