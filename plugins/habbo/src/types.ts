export interface HabboUser {
  id: number | string;
  username: string;
  motto: string;
  look: string;
  rank: number;
  credits: number;
  online: boolean | string | number;
  createdAt: string | number;
  lastLogin: string | number;
}

export interface HabboRoom {
  id: number | string;
  name: string;
  description: string;
  ownerName: string;
  ownerId: number | string;
  usersNow: number;
  usersMax: number;
  state: string;
  thumbnailUrl?: string;
}

export interface HabboCatalogPage {
  id: number | string;
  parentId: number | string;
  caption: string;
  pageLayout: string;
  visible: boolean;
  enabled: boolean;
}

export interface HabboGuild {
  id: number | string;
  name: string;
  description: string;
  ownerId: number | string;
  badge: string;
  memberCount?: number;
}
