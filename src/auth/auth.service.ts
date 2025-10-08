import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import type { Response } from 'express';
import { UsersService } from 'src/modules/users/users.service';
import { AuthHelpers } from 'src/shared/helpers/auth.helpers';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    const isPasswordValid = await AuthHelpers.verify(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    return user;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '5m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
    const hashedRefreshToken = await AuthHelpers.hash(refreshToken);

    await this.usersService.refreshToken(user.id, hashedRefreshToken as string);

    return {
      payload,
      accessToken,
      refreshToken,
    };
  }

  async getInfo(id: number) {
    return await this.usersService.findOne(id);
  }
}
