import {UserSDK, PageSDK} from '@gustav/sdk';

const API_URL = 'http://localhost:3000/api';
export const userSdk = new UserSDK(API_URL);
export const pageSdk = new PageSDK(API_URL);
