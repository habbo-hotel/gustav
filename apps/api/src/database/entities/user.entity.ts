import {Entity, Column} from 'typeorm';

import {BaseEntity} from './base.entity';

@Entity('gustav_users')
export class User extends BaseEntity {
  @Column({unique: true})
  username!: string;

  @Column({unique: true})
  email!: string;

  @Column({nullable: true, name: 'first_name'})
  firstName?: string;

  @Column({nullable: true, name: 'last_name'})
  lastName?: string;

  @Column({nullable: true, select: false})
  password?: string;

  @Column({nullable: true, name: 'discord_id'})
  discordId?: string;

  @Column({default: false, name: 'is_super_admin'})
  isSuperAdmin!: boolean;
}
