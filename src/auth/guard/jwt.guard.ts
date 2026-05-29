import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ERole } from 'src/shared/constants/global.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super(reflector);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<ERole[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest<{ roles?: ERole[] }>();

    if (roles?.includes(ERole.PUBLIC)) {
      return true;
    }

    if (roles?.length) {
      request.roles = roles;
    }

    return super.canActivate(context);
  }
}
