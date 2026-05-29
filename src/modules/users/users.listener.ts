import { Prisma } from '@prisma/client';
import { AuthHelpers } from 'src/shared/helpers/auth.helpers';

const onCreated: Prisma.Middleware = async (params, next) => {
  if (params.model === 'User' && params.action === 'create') {
    const args = params.args as { data: { password: string } };
    args.data.password = await AuthHelpers.hash(args.data.password);
  }

  return next(params);
};

export const UserListener = {
  onCreated,
};
