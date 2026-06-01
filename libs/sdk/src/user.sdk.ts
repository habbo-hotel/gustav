import {UserWire, AdminStatsWire, CreateUserInput} from '@gustav/types';

import {BaseSDK} from './base.sdk';

export class UserSDK extends BaseSDK {
  async getUser(id: number): Promise<UserWire> {
    return this.get<UserWire>(`/user/find/${id}`);
  }

  async getAdminStats(): Promise<AdminStatsWire> {
    return this.get<AdminStatsWire>('/user/admin-stats');
  }

  async listUsers(): Promise<UserWire[]> {
    return this.get<UserWire[]>('/user/list');
  }

  async createUser(input: CreateUserInput): Promise<UserWire> {
    return this.post<UserWire>('/user/create', input);
  }

  async deleteUser(id: number): Promise<void> {
    return this.delete(`/user/${id}`);
  }

  async resetPassword(userId: number): Promise<void> {
    return this.post(`/user/reset-password/${userId}`, {});
  }
}
