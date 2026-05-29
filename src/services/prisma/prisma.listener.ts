import { Prisma } from '@prisma/client';
import { SOFT_DELETE_MODEL_NAMES } from './prisma.config';

type AnyArgs = Record<string, Record<string, unknown> | undefined>;

const onFind: Prisma.Middleware = (params, next) => {
  if (SOFT_DELETE_MODEL_NAMES.includes(params.model ?? '')) {
    const args = params.args as AnyArgs;

    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';

      if (args.where) {
        if (args.where['deletedAt'] === undefined) {
          args.where['deletedAt'] = null;
        }
      } else {
        args['where'] = { deletedAt: null };
      }
    }

    if (params.action === 'findMany' || params.action === 'count') {
      if (args.where) {
        if (args.where['deletedAt'] === undefined) {
          args.where['deletedAt'] = null;
        }
      } else {
        args['where'] = { deletedAt: null };
      }
    }
  }

  return next(params);
};

const onDeleted: Prisma.Middleware = (params, next) => {
  if (SOFT_DELETE_MODEL_NAMES.includes(params.model ?? '')) {
    const args = params.args as AnyArgs;

    if (params.action === 'delete') {
      params.action = 'update';
      args['data'] = { deletedAt: new Date() };
    }

    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (args.data !== undefined) {
        args.data['deletedAt'] = new Date();
      } else {
        args['data'] = { deletedAt: new Date() };
      }
    }
  }

  return next(params);
};

export const PrismaListener = {
  onFind,
  onDeleted,
};
