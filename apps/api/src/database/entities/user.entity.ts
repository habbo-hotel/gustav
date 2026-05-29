import {Entity, Column} from 'typeorm';
import {BaseEntity} from './base.entity';
import {User as UserInterface} from '@gustav/types';

@Entity('users')
export class User extends BaseEntity implements UserInterface {
  @Column({unique: true})
  username!: string;

  @Column({unique: true})
  email!: string;

  @Column({nullable: true, select: false})
  password?: string;

  @Column({nullable: true})
  discordId?: string;

  @Column({default: false})
  isSuperAdmin!: boolean;
}
