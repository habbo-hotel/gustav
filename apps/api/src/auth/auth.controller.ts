import {Response, Request} from 'express';
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
  Res,
  Header,
  UnauthorizedException,
} from '@nestjs/common';

import {AuthService} from './auth.service';

type RequestWithUser = Request & {user: UserWire};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  async login(
    @NestRequest() req: RequestWithUser,
    @Res({passthrough: true}) res: Response
  ): Promise<UserWire> {
    const tokens = this.authService.generateTokens(req.user);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return req.user;
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
    @NestRequest() req: RequestWithUser,
    @Res({passthrough: true}) res: Response
  ): Promise<void> {
    const tokens = this.authService.generateTokens(req.user);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    // Since discord callback is a redirect flow, redirect to frontend after setting cookies
    res.redirect('http://localhost:5173');
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @NestRequest() req: Request,
    @Res({passthrough: true}) res: Response
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const payload = this.authService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    // We mock a simple user object for generateTokens, but usually you'd fetch the full user
    const user: UserWire = {
      id: payload.sub,
      email: payload.email,
      username: '', // Not strictly needed for token generation in our current setup
      isSuperAdmin: false,
    };

    const tokens = this.authService.generateTokens(user);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return {message: 'Tokens refreshed'};
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @Header('Cache-Control', 'no-store')
  me(@NestRequest() req: RequestWithUser): UserWire {
    return req.user;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({passthrough: true}) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return {message: 'Logged out'};
  }
}
