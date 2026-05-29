import {BaseSDK} from './base.sdk';
import {User} from '@gustav/types';

export class UserSDK extends BaseSDK {
  async getUser(id: number): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }

  async getAdminOnlyData(): Promise<any> {
    return this.get('/users/admin-only');
  }
}
