import 'reflect-metadata';
import {join} from 'path';
import * as dotenv from 'dotenv';
import {DataSource} from 'typeorm';

import {User} from './entities/user.entity';
import {Page} from './entities/page.entity';
import {PageComponent} from './entities/page-component.entity';

// Load environment variables from apps/api/.env
dotenv.config({path: join(__dirname, '../../.env')});

export const AppDataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'gustav',
  entities: [User, Page, PageComponent],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false, // Disabled in favor of migrations
  charset: 'utf8mb4',
});
