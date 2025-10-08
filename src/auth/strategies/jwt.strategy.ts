import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ERole, JWT_SECRET } from 'src/shared/constants/global.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromHeader('authorization'),
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET as string,
      passReqToCallback: true,
    });
  }

  validate(
    req: Request & { roles: string[] },
    payload: { sub: string; email: string; name: string; role: ERole },
  ) {
    const roles = req.roles;

    if (roles && roles.length > 0) {
      const hasPermission = roles.includes(payload.role);
      if (!hasPermission) {
        throw new ForbiddenException('You not have permission');
      }
    }

    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}
