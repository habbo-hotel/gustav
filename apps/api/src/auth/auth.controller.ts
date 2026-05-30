import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  HttpCode,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {AuthService} from './auth.service';
import {UserWire, RegisterInput} from '@gustav/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  async login(@Request() req: any): Promise<UserWire> {
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
  async discordAuthCallback(@Request() req: any): Promise<UserWire> {
    return req.user;
  }

  @Get('profile')
  getProfile(@Request() req: any): UserWire {
    return req.user;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Request() req: any) {
    req.session.destroy();
    return {message: 'Logged out'};
  }
}
