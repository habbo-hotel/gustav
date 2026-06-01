import {BaseSDK} from './base.sdk';
import {UserWire, RegisterInput} from '@gustav/types';

export class AuthSDK extends BaseSDK {
  async loginWithPassword(email: string, password: string): Promise<UserWire> {
    return this.post<UserWire>('/auth/login', {email, password});
  }

  async register(userData: RegisterInput): Promise<UserWire> {
    return this.post<UserWire>('/auth/register', userData);
  }

  async logout(): Promise<void> {
    await this.post('/auth/logout');
  }

  async loginWithDiscord(): Promise<void> {
    window.location.href = `${this.baseUrl}/auth/discord`;
  }

  async me(): Promise<UserWire> {
    return this.get<UserWire>('/auth/me');
  }
}
