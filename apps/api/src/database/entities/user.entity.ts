import {Entity, Column} from 'typeorm';

import {BaseEntity} from './base.entity';

@Entity('gustav_users')
export class User extends BaseEntity {
  @Column({unique: true})
  username!: string;

  @Column({unique: true})
  email!: string;

  @Column({nullable: true})
  firstName?: string;

  @Column({nullable: true})
  lastName?: string;

  @Column({nullable: true, select: false})
  password?: string;

  @Column({nullable: true})
  discordId?: string;

  @Column({default: false})
  isSuperAdmin!: boolean;
}
