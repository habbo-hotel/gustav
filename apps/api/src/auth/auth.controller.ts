import {Request} from 'express';
import {AuthGuard} from '@nestjs/passport';
import {UserWire, RegisterInput} from '@gustav/types';
import {
  Controller,
  Post,
  UseGuards,
  Request as NestRequest,
  Get,
  Body,
  HttpCode,
} from '@nestjs/common';

import {AuthService} from './auth.service';

type RequestWithUser = any;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  async login(@NestRequest() req: RequestWithUser): Promise<UserWire> {
    return new Promise((resolve, reject) => {
      req.logIn(req.user, (err: Error | null) => {
        if (err) {
          console.error('Passport logIn error:', err);
          return reject(err);
        }
        req.session.save((saveErr: Error | null) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return reject(saveErr);
          }
          resolve(req.user);
        });
      });
    });
  }

  @Post('register')
  async register(@Body() userData: RegisterInput): Promise<UserWire> {
    return this.authService.register(userData);
  }

  @UseGuards(AuthGuard('discord'))
  @Get('discord')
  async discordAuth() {
    // Guards handle redirection
  }

  @UseGuards(AuthGuard('discord'))
  @Get('discord/callback')
  async discordAuthCallback(
    @NestRequest() req: RequestWithUser
  ): Promise<UserWire> {
    return req.user;
  }

  @Get('me')
  me(@NestRequest() req: RequestWithUser): UserWire {
    return req.user;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@NestRequest() req: RequestWithUser) {
    req.session.destroy();
    return {message: 'Logged out'};
  }
}
