import {
  HabboUser,
  HabboRoom,
  HabboCatalogPage,
  HabboGuild,
} from '@gustav/habbo-plugin';

export interface MS3User extends HabboUser {
  real_name: string;
  password?: string;
  mail?: string;
  mail_verified: '0' | '1';
  account_created: number;
  account_day_of_birth: number;
  last_online: number;
  gender: 'M' | 'F';
  credits: number;
  pixels: number;
  points: number;
  online: '0' | '1' | '2';
  ip_register: string;
  ip_current: string;
  machine_id: string;
  home_room: number;
}

export interface MS3Room extends HabboRoom {
  owner_id: number;
  owner_name: string;
  password?: string;
  state: 'open' | 'locked' | 'password' | 'invisible';
  users: number;
  users_max: number;
  guild_id: number;
  category: number;
  score: number;
  is_public: '0' | '1';
}

export interface MS3CatalogPage extends HabboCatalogPage {
  icon_color: number;
  icon_image: number;
  min_rank: number;
  order_num: number;
  club_only: '0' | '1';
  vip_only: '1' | '0';
}

export interface MS3Guild extends HabboGuild {
  user_id: number;
  state: number;
  rights: '0' | '1';
  color_one: number;
  color_two: number;
  date_created: number;
}
