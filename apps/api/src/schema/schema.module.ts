import {Module} from '@nestjs/common';

import {SchemaService} from './schema.service';
import {SchemaController} from './schema.controller';
import {PluginSchemaModule} from './plugin-schema.module';
import {PublicSchemaController} from './public-schema.controller';
import {DynamicRecordRepository} from '../database/repositories/dynamic-record.repository';
import {DynamicSchemaRepository} from '../database/repositories/dynamic-schema.repository';
import {PageComponentRepository} from '../database/repositories/page-component.repository';

@Module({
  imports: [PluginSchemaModule],
  providers: [
    SchemaService,
    DynamicSchemaRepository,
    DynamicRecordRepository,
    PageComponentRepository,
  ],
  controllers: [SchemaController, PublicSchemaController],
  exports: [SchemaService],
})
export class SchemaModule {}
