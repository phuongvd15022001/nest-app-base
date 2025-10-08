import { SetMetadata } from '@nestjs/common';
import { ERole } from 'src/shared/constants/global.constants';

export const Roles = (...roles: ERole[]) => SetMetadata('roles', roles);
