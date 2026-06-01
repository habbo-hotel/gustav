import {BaseSDK} from './base.sdk';
import {UserWire, AdminStatsWire} from '@gustav/types';

export class UserSDK extends BaseSDK {
  async getUser(id: number): Promise<UserWire> {
    return this.get<UserWire>(`/users/${id}`);
  }

  async getAdminStats(): Promise<AdminStatsWire> {
    return this.get<AdminStatsWire>('/users/admin-stats');
  }
}
