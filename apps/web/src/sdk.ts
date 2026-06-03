import {UserSDK, PageSDK, SchemaSDK} from '@gustav/sdk';

const API_URL = 'http://localhost:3000/api';
export const userSdk = new UserSDK(API_URL);
export const pageSdk = new PageSDK(API_URL);
export const schemaSdk = new SchemaSDK(API_URL);
