import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Explicit CORS for direct access
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.use((req: any, res: any, next: any) => {
    if (req.url.startsWith('/api/auth')) {
      console.log(
        `[API] ${req.method} ${req.url} - Cookie: ${req.headers.cookie ? 'Present' : 'None'}`
      );
    }
    next();
  });

  app.use(cookieParser());
  app.use(
    session({
      name: 'gustav.sid',
      secret: 'secretKey',
      resave: true,
      saveUninitialized: true,
      cookie: {
        maxAge: 3600000,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const port = 3000;
  // Listen on 0.0.0.0 to accept everything
  await app.listen(port, '0.0.0.0');
  console.log(`Backend is running on http://localhost:${port}`);
}
bootstrap();
