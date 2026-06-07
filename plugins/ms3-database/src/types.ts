export interface MS3User {
  id: number;
  username: string;
  real_name: string;
  password?: string; // Optional for security in some contexts
  mail?: string;
  mail_verified: '0' | '1';
  account_created: number;
  account_day_of_birth: number;
  last_login: number;
  last_online: number;
  motto: string;
  look: string;
  gender: 'M' | 'F';
  rank: number;
  credits: number;
  pixels: number;
  points: number;
  online: '0' | '1' | '2';
  auth_ticket: string;
  ip_register: string;
  ip_current: string;
  machine_id: string;
  home_room: number;
  secret_key?: string;
  pincode?: string;
  extra_rank?: number;
}

export interface MS3Room {
  id: number;
  owner_id: number;
  owner_name: string;
  name: string;
  description: string;
  model: string;
  password?: string;
  state: 'open' | 'locked' | 'password' | 'invisible';
  users: number;
  users_max: number;
  guild_id: number;
  category: number;
  score: number;
  paper_floor: string;
  paper_wall: string;
  paper_landscape: string;
  thickness_wall: number;
  wall_height: number;
  thickness_floor: number;
  moodlight_data: string;
  tags: string;
  is_public: '0' | '1';
  is_staff_picked: '0' | '1';
  allow_other_pets: '0' | '1';
  allow_other_pets_eat: '0' | '1';
  allow_walkthrough: '0' | '1';
  allow_hidewall: '0' | '1';
  chat_mode: number;
  chat_weight: number;
  chat_speed: number;
  chat_hearing_distance: number;
  chat_protection: number;
  override_model: '0' | '1';
  who_can_mute: number;
  who_can_kick: number;
  who_can_ban: number;
  poll_id: number;
  roller_speed: number;
  promoted: '0' | '1';
  trade_mode: number;
  move_diagonally: '0' | '1';
  jukebox_active: '0' | '1';
  hidewired: '0' | '1';
  is_forsale: '0' | '1' | '2';
}

export interface MS3CatalogPage {
  id: number;
  parent_id: number;
  caption_save: string;
  caption: string;
  page_layout: string;
  icon_color: number;
  icon_image: number;
  min_rank: number;
  order_num: number;
  visible: '0' | '1';
  enabled: '0' | '1';
  club_only: '0' | '1';
  vip_only: '1' | '0';
  page_headline: string;
  page_teaser: string;
  page_special?: string;
  page_text1?: string;
  page_text2?: string;
  page_text_details?: string;
  page_text_teaser?: string;
  room_id?: number;
  includes: string;
}

export interface MS3Guild {
  id: number;
  user_id: number;
  name: string;
  description: string;
  room_id: number;
  state: number;
  rights: '0' | '1';
  color_one: number;
  color_two: number;
  badge: string;
  date_created: number;
  forum: '0' | '1';
  read_forum: 'EVERYONE' | 'MEMBERS' | 'ADMINS';
  post_messages: 'EVERYONE' | 'MEMBERS' | 'ADMINS' | 'OWNER';
  post_threads: 'EVERYONE' | 'MEMBERS' | 'ADMINS' | 'OWNER';
  mod_forum: 'ADMINS' | 'OWNER';
}
