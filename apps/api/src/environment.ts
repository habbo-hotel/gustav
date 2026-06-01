import {config} from 'dotenv';
import {InternalServerErrorException} from '@nestjs/common';

config();

function getSecretValue(key: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new InternalServerErrorException(
        `Environment variable ${key} is not set`
      );
    }
    console.warn(`⚠️ Warning: Environment variable ${key} is not set`);
    return `MISSING_${key}`;
  }
  return value;
}

export const SENDGRID_API_KEY = getSecretValue('SENDGRID_API_KEY');
export const SENDGRID_FROM_EMAIL = getSecretValue('SENDGRID_FROM_EMAIL');
export const SENDGRID_RESET_PASSWORD_TEMPLATE_ID = getSecretValue(
  'SENDGRID_RESET_PASSWORD_TEMPLATE_ID'
);
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
