import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UsersService } from 'src/modules/users/users.service';
import {} from 'src/services/prisma/prisma.service';
import { AuthHelpers } from 'src/shared/helpers/auth.helpers';
import { UserPayload } from 'src/shared/interfaces/jwt-payload.interface';

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

  login(user: User) {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: payload,
      accessToken,
    };
  }
}
