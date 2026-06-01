import request from 'supertest';
import {INestApplication} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';

import {HealthModule} from './health.module';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health/status (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health/status')
      .expect(200)
      .expect(res => {
        expect(res.body.status).toBe('ok');
        expect(res.body.timestamp).toBeDefined();
      });
  });
});
