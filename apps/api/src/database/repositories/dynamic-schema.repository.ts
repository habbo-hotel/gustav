import {DataSource} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {BaseRepository} from './base.repository';
import {DynamicSchema} from '../entities/dynamic-schema.entity';

@Injectable()
export class DynamicSchemaRepository extends BaseRepository<DynamicSchema> {
  constructor(dataSource: DataSource) {
    super(DynamicSchema, dataSource);
  }
}
