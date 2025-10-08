import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guard/local.guard';
import { JwtRefreshAuthGuard } from './guard/jwt-refresh.guard';
import { User } from '@prisma/client';
import { RefreshTokenDto } from './dto/refesh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Request() req: Request & { user: User }) {
    const user = req.user;
    return this.authService.login(user);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @ApiBody({ type: RefreshTokenDto })
  async refreshTokens(@Request() req: Request & { user: User }) {
    const user = req.user;
    return this.authService.login(user);
  }
}
