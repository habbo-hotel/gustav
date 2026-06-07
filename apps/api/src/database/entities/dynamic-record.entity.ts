import {Entity, Column, ManyToOne, JoinColumn, Index} from 'typeorm';

import {BaseEntity} from './base.entity';
import {DynamicSchema} from './dynamic-schema.entity';

@Entity('gustav_dynamic_records')
export class DynamicRecord extends BaseEntity {
  @Index()
  @Column({name: 'schema_id'})
  schemaId!: number;

  @ManyToOne(() => DynamicSchema, schema => schema.records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({name: 'schema_id'})
  schema!: DynamicSchema;

  @Column({type: 'text'})
  data!: string;
}
