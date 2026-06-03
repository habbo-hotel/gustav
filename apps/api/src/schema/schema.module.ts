import {Module} from '@nestjs/common';

import {SchemaService} from './schema.service';
import {SchemaController} from './schema.controller';
import {DynamicRecordRepository} from '../database/repositories/dynamic-record.repository';
import {DynamicSchemaRepository} from '../database/repositories/dynamic-schema.repository';

@Module({
  providers: [SchemaService, DynamicSchemaRepository, DynamicRecordRepository],
  controllers: [SchemaController],
  exports: [SchemaService],
})
export class SchemaModule {}
