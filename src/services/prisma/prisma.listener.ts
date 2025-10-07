/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SOFT_DELETE_MODEL_NAMES } from './prisma.config';

const onFind = (params, next): any => {
  if (SOFT_DELETE_MODEL_NAMES.includes(params.model)) {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      // Change to findFirst - you cannot filter
      // By anything except ID / unique with findUnique
      params.action = 'findFirst';

      // Add 'deletedAt' filter
      if (params.args.where) {
        if (params.args.where.deletedAt == undefined) {
          // Exclude deletedAt records if they have not been explicitly requested
          params.args.where['deletedAt'] = null;
        }
      } else {
        params.args['where'] = { deletedAt: null };
      }
    }

    if (params.action === 'findMany' || params.action === 'count') {
      // Find many queries
      if (params.args.where) {
        if (params.args.where.deletedAt == undefined) {
          // Exclude deletedAt records if they have not been explicitly requested
          params.args.where['deletedAt'] = null;
        }
      } else {
        params.args['where'] = { deletedAt: null };
      }
    }
  }

  return next(params);
};

const onDeleted = (params, next): any => {
  // Check incoming query type
  if (SOFT_DELETE_MODEL_NAMES.includes(params.model)) {
    if (params.action == 'delete') {
      // Delete queries
      // Change action to an update
      params.action = 'update';
      params.args['data'] = { deletedAt: new Date() };
    }

    if (params.action == 'deleteMany') {
      // Delete many queries
      params.action = 'updateMany';
      if (params.args.data != undefined) {
        params.args.data['deletedAt'] = new Date();
      } else {
        params.args['data'] = { deletedAt: new Date() };
      }
    }
  }

  return next(params);
};

export const PrismaListener = {
  onFind,
  onDeleted,
};
