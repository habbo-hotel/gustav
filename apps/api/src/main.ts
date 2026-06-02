import {NestFactory} from '@nestjs/core';
import cookieParser from 'cookie-parser';

import {AppModule} from './app.module';

async function bootstrap() {
  const appModule = await AppModule.registerPlugins();
  const app = await NestFactory.create(appModule);

  app.setGlobalPrefix('api');

  // Explicit CORS for direct access
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.use((req: any, res: any, next: any) => {
    next();
  });

  app.use(cookieParser());

  const port = 3000;
  // Listen on 0.0.0.0 to accept everything
  await app.listen(port, '0.0.0.0');
}
bootstrap();
