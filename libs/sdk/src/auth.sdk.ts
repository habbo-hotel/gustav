import {BaseSDK} from './base.sdk';
import {User} from '@gustav/types';

export class AuthSDK extends BaseSDK {
  async loginWithPassword(email: string, password: string): Promise<User> {
    return this.post<User>('/auth/login', {email, password});
  }

  async register(userData: any): Promise<User> {
    return this.post<User>('/auth/register', userData);
  }

  async logout(): Promise<void> {
    await this.post('/auth/logout');
  }

  async loginWithDiscord(): Promise<void> {
    window.location.href = `${this.baseUrl}/auth/discord`;
  }

  async getProfile(): Promise<any> {
    return this.get('/auth/profile');
  }
}
