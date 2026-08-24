import { Prisma } from '@prisma/client';
import { PrismaListener } from './prisma.listener';

type Params = Prisma.MiddlewareParams;

type ForwardedArgs = {
  where?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

const buildParams = (
  model: string,
  action: Prisma.PrismaAction,
  args: Record<string, unknown>,
): Params => ({
  model: model as Prisma.ModelName,
  action,
  args,
  dataPath: [],
  runInTransaction: false,
});

/** Reads back the params the middleware handed to `next`, with `args` typed. */
const forwarded = (next: jest.Mock) => {
  const calls = next.mock.calls as Params[][];
  const params = calls[0][0];
  return { action: params.action, args: params.args as ForwardedArgs };
};

describe('PrismaListener', () => {
  describe('onDeleted', () => {
    it('rewrites a Product delete into a soft delete', async () => {
      const next = jest.fn().mockResolvedValue(null);
      const params = buildParams('Product', 'delete', { where: { id: 1 } });

      await PrismaListener.onDeleted(params, next);

      const sent = forwarded(next);
      expect(sent.action).toBe('update');
      expect(sent.args.where).toEqual({ id: 1 });
      expect(sent.args.data.deletedAt).toBeInstanceOf(Date);
    });

    it('rewrites a Product deleteMany into updateMany', async () => {
      const next = jest.fn().mockResolvedValue(null);
      const params = buildParams('Product', 'deleteMany', {
        where: { userId: 3 },
      });

      await PrismaListener.onDeleted(params, next);

      const sent = forwarded(next);
      expect(sent.action).toBe('updateMany');
      expect(sent.args.data.deletedAt).toBeInstanceOf(Date);
    });

    it('leaves an unregistered model as a hard delete', async () => {
      const next = jest.fn().mockResolvedValue(null);
      const params = buildParams('Unregistered', 'delete', {
        where: { id: 1 },
      });

      await PrismaListener.onDeleted(params, next);

      const sent = forwarded(next);
      expect(sent.action).toBe('delete');
      expect(sent.args.data).toBeUndefined();
    });
  });

  describe('onFind', () => {
    it('rewrites a Product findUnique into a findFirst that skips deleted rows', async () => {
      const next = jest.fn().mockResolvedValue(null);
      const params = buildParams('Product', 'findUnique', {
        where: { id: 1 },
      });

      await PrismaListener.onFind(params, next);

      const sent = forwarded(next);
      expect(sent.action).toBe('findFirst');
      expect(sent.args.where).toEqual({ id: 1, deletedAt: null });
    });

    it('keeps existing Product filters when injecting deletedAt', async () => {
      const next = jest.fn().mockResolvedValue([]);
      const params = buildParams('Product', 'findMany', {
        where: { name: { contains: 'chicken' } },
      });

      await PrismaListener.onFind(params, next);

      const sent = forwarded(next);
      expect(sent.args.where).toEqual({
        name: { contains: 'chicken' },
        deletedAt: null,
      });
    });

    it('applies the same filter to Product count', async () => {
      const next = jest.fn().mockResolvedValue(0);
      const params = buildParams('Product', 'count', {});

      await PrismaListener.onFind(params, next);

      const sent = forwarded(next);
      expect(sent.args.where).toEqual({ deletedAt: null });
    });

    it('does not override an explicit deletedAt filter', async () => {
      const next = jest.fn().mockResolvedValue([]);
      const params = buildParams('Product', 'findMany', {
        where: { deletedAt: { not: null } },
      });

      await PrismaListener.onFind(params, next);

      const sent = forwarded(next);
      expect(sent.args.where).toEqual({ deletedAt: { not: null } });
    });

    it('leaves an unregistered model untouched', async () => {
      const next = jest.fn().mockResolvedValue([]);
      const params = buildParams('Unregistered', 'findMany', {
        where: { id: 1 },
      });

      await PrismaListener.onFind(params, next);

      const sent = forwarded(next);
      expect(sent.args.where).toEqual({ id: 1 });
    });
  });
});
