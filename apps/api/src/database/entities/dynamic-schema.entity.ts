import {Entity, Column, OneToMany, Index} from 'typeorm';

import {BaseEntity} from './base.entity';
import {DynamicRecord} from './dynamic-record.entity';

@Entity('gustav_dynamic_schemas')
export class DynamicSchema extends BaseEntity {
  @Column()
  name!: string;

  @Index({unique: true})
  @Column()
  slug!: string;

  @Column({type: 'text', nullable: true})
  description?: string;

  @Column({type: 'text'})
  fields!: string;

  @OneToMany(() => DynamicRecord, record => record.schema, {
    cascade: true,
  })
  records?: DynamicRecord[];
}
