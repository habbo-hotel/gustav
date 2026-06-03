import {DataSource} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {BaseRepository} from './base.repository';
import {DynamicRecord} from '../entities/dynamic-record.entity';

@Injectable()
export class DynamicRecordRepository extends BaseRepository<DynamicRecord> {
  constructor(dataSource: DataSource) {
    super(DynamicRecord, dataSource);
  }
}
