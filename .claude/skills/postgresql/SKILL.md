---
name: postgresql
description: PostgreSQL and Prisma guidance for schema design, migrations, indexing, query patterns, N+1 prevention, soft delete, and transactions.
metadata:
  stack: postgresql, prisma
---

# PostgreSQL And Prisma

Use this skill when creating or reviewing Prisma models, migrations, repositories, query logic, indexes, and transactions.

Schema lives in `prisma/schema.prisma`. Migrations live in `prisma/migrations/`. The client is exposed through `PrismaService` (`src/services/prisma/prisma.service.ts`), which is provided by the `@Global()` `PrismaModule`.

## Schema Conventions

| Area | Rule |
| --- | --- |
| Primary key | `Int @id @default(autoincrement())` |
| Field names | `camelCase` in the schema; no `@map` unless an existing table requires it |
| Timestamps | `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt` |
| Soft delete | Nullable `deletedAt DateTime?` |
| Relations | Explicit scalar FK field plus `@relation(fields: [...], references: [...])` |
| Delete behavior | Set `onDelete` explicitly on relations |
| Migrations | One logical schema change per migration |

## Model Pattern

```prisma
model Order {
  id        Int       @id @default(autoincrement())
  status    String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  userId Int
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

## Soft Delete

Soft delete is enforced globally by Prisma middleware in `src/services/prisma/prisma.listener.ts`:

- `PrismaListener.onDeleted` rewrites `delete` to `update` and `deleteMany` to `updateMany`, setting `deletedAt`.
- `PrismaListener.onFind` injects `deletedAt: null` into `findUnique`, `findFirst`, `findMany`, and `count`.

The middleware only applies to models listed in `SOFT_DELETE_MODEL_NAMES` (`src/services/prisma/prisma.config.ts`).

- When a new model needs soft delete, add `deletedAt DateTime?` **and** register the model name in `SOFT_DELETE_MODEL_NAMES`.
- `onFind` rewrites `findUnique` to `findFirst`. Do not rely on `findUnique` returning a unique-constraint-only lookup for soft-delete models.
- Middleware does not cover raw queries or nested relation filters. Filter `deletedAt` explicitly there.

## Migration Rules

- Create migrations with `npx prisma migrate dev --name <change_name>`; never hand-edit an applied migration.
- Prisma migrations are forward-only: there is no `down()`. **Rollback means writing a new forward migration that reverses the change.** State the reverse migration in the plan before applying a destructive change.
- For a destructive change (drop column, drop table, narrow a type, add a `NOT NULL` column to a populated table), split it: add the new shape, backfill, then remove the old shape in a later migration.
- Review the generated SQL in `prisma/migrations/<timestamp>_<name>/migration.sql` before committing.
- Add indexes with `@@index` / `@@unique` for common filter, join, and sort paths.
- Run `npx prisma generate` after schema changes so `Prisma.*` types stay in sync.
- Do not include production data dumps in migrations.

## Query Rules

Data access goes through a per-feature repository (`src/modules/<feature>/<feature>.repository.ts`) that wraps `PrismaService` with params-object methods. Services hold business logic; repositories hold Prisma calls.

- Whitelist dynamic sort fields against the generated scalar enum before building `orderBy`. `CommonHelpers.transformPaginationQuery(dto, Prisma.<Model>ScalarFieldEnum)` already does this — reuse it instead of trusting `dto.sortBy`.
- Use `skip` / `take` for paginated list endpoints, and pair the list query with a `count` on the same `where`.
- Use `include` or `select` explicitly for relation data. Do not fetch relations you do not return.
- Use `select` to keep sensitive columns (e.g. `password`, `refreshToken`) out of results.
- Batch relation lookups with `where: { id: { in: ids } }` instead of querying inside a loop.

```typescript
const { take, skip, sortByField } = CommonHelpers.transformPaginationQuery(
  getListOrdersDto,
  Prisma.OrderScalarFieldEnum,
);

const where: Prisma.OrderWhereInput = {
  userId,
  status: { contains: getListOrdersDto.search, mode: Prisma.QueryMode.insensitive },
};

const [orders, total] = await Promise.all([
  this.ordersRepository.findAll({ take, skip, orderBy: sortByField, where }),
  this.ordersRepository.count({ where }),
]);
```

## Transactions

Use a transaction when one business action writes multiple tables or depends on read-modify-write consistency.

```typescript
return this.prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.orderItem.createMany({
    data: items.map((item) => ({ ...item, orderId: order.id })),
  });
  return order;
});
```

- Use the `tx` client inside the callback. A call to `this.prisma` inside a transaction runs outside it.
- Keep transactions short. Do not await external HTTP calls inside a transaction.
- `$transaction([...])` with an array is fine for independent writes that need atomicity but no intermediate reads.

## Raw Queries

- Prefer the query builder API. Use raw SQL only when Prisma cannot express the query.
- Use `$queryRaw` with tagged-template parameters. Never interpolate user input into `$queryRawUnsafe`.
- Raw queries bypass soft-delete middleware; add `deleted_at IS NULL` yourself.

## Checklist

- [ ] Model uses `Int @id @default(autoincrement())` unless the project says otherwise.
- [ ] Timestamps use `@default(now())` and `@updatedAt`.
- [ ] Soft-delete models have `deletedAt` and are registered in `SOFT_DELETE_MODEL_NAMES`.
- [ ] Relations declare explicit FK fields and `onDelete`.
- [ ] Migration SQL was reviewed; destructive changes have a documented reverse migration.
- [ ] `npx prisma generate` was run after schema changes.
- [ ] Sort fields are whitelisted through the scalar field enum.
- [ ] List queries paginate and count on the same `where`.
- [ ] Relations use explicit `include` / `select` and do not cause N+1 queries.
- [ ] Multi-table writes use `$transaction` and use the `tx` client throughout.
