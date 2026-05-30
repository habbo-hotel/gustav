import {BaseSDK} from './base.sdk';
import {UserWire} from '@gustav/types';

export class UserSDK extends BaseSDK {
  async getUser(id: number): Promise<UserWire> {
    return this.get<UserWire>(`/users/${id}`);
  }

  async getAdminOnlyData(): Promise<any> {
    return this.get('/users/admin-only');
  }
}
