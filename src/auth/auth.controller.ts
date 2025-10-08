import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guard/local.guard';
import type { AuthenticatedRequest } from 'src/shared/interfaces/authenticated-request.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  @ApiBody({ type: LoginDto })
  login(@Request() req: AuthenticatedRequest) {
    const user = req.user;
    return this.authService.login(user);
  }
}
