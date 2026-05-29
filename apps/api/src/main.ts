import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'secretKey',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
