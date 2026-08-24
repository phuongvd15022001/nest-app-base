---
name: nestjs-best-practices
description: NestJS backend guidance for feature modules, controllers, services, DTOs, guards, error handling, Prisma integration, Redis cache use, and tests.
metadata:
  stack: nestjs, typescript, rest, jwt, prisma, postgresql, redis
---

# NestJS Best Practices

Use this skill when writing, reviewing, or refactoring NestJS backend code.

## Architecture

- Organize code by feature module under `src/modules/`. A module owns its controller, service, repository, DTOs, tests, and cache behavior.
- Prefer small services with one clear responsibility over broad service classes.
- Use constructor injection. Do not instantiate providers manually inside services.
- Avoid circular module dependencies. Extract shared behavior into a small provider only when two or more modules need it.
- Do not let controllers contain business logic. Controllers parse input, apply guards, call services, and return response DTOs.
- Do not return raw Prisma model objects from controllers.

## Controllers

- Use REST routes with stable resource names.
- Protect non-public routes with the project guard pattern: `@UseGuards(JwtAuthGuard)` plus `@Roles(ERole.…)`, and `@CurrentUser()` for the authenticated user.
- Validate query, params, and body through DTO classes.
- Keep pagination and filtering explicit in request DTOs.
- Return response DTOs or plain objects shaped by the project contract.

## Services

- Keep write flows transactional when they touch multiple tables.
- Keep read flows explicit about relations to avoid N+1 behavior.
- Throw NestJS exceptions such as `NotFoundException`, `BadRequestException`, and `ForbiddenException`.
- Keep external side effects behind injectable providers so tests can replace them.
- Invalidate Redis cache immediately after successful writes.

## DTOs And Validation

- Request DTOs use `class-validator` decorators, plus `@ApiProperty` / `@ApiPropertyOptional` for Swagger.
- Ids are numeric: use `@IsNumber()` with `@Type(() => Number)` in DTOs and `ParseIntPipe` on route params.
- Use `@IsEnum()` for enumerated values, including Prisma-generated enums (`Role`, `Prisma.SortOrder`).
- Prefer explicit optional fields with `@IsOptional()`.
- Extend `BasePaginationDto` for list queries instead of redeclaring `page`, `limit`, `sortBy`, `direction`, and `search`.
- Do not accept raw `orderBy` or `sort` fields without whitelisting. Pass `sortBy` through `CommonHelpers.transformPaginationQuery` with the model's `Prisma.<Model>ScalarFieldEnum`.
- Response DTOs must omit sensitive fields and expose only contract fields. Apply them with `TransformInterceptor` as the existing controllers do.

## Prisma Integration

- Keep Prisma calls inside a per-feature repository (`src/modules/<feature>/<feature>.repository.ts`). Services depend on the repository, not on `PrismaService`.
- Follow the existing repository shape: params-object methods (`findAll`, `count`, `findOne`, `create`, `update`, `delete`, `createMany`) typed with generated `Prisma.*` input types.
- `PrismaModule` is `@Global()`, so a feature module does not re-import it. Register the feature repository in the feature module's `providers`.
- Load relations explicitly with `include` or `select`. Never assume implicit relation loading.
- Use `select` to keep sensitive columns out of query results instead of deleting them afterwards.
- Use `this.prisma.$transaction` for multi-table writes, and use the `tx` client inside the callback.
- Soft delete is handled by Prisma middleware for models in `SOFT_DELETE_MODEL_NAMES`. Do not re-implement it per service.
- Never build schema changes by hand against the database. Change `prisma/schema.prisma`, then run `npx prisma migrate dev` and `npx prisma generate`.

## Redis

- Use cache-aside for read-heavy resources.
- Give every cache key a TTL.
- Use predictable key names: `<model>:<scope>:<id>`.
- Delete or refresh cache keys after writes.

## Testing

- Unit test service logic with Nest testing utilities.
- Use Supertest for endpoint behavior.
- Test guards, validation errors, missing records, and write failures where relevant.
- Bug fixes require a regression test that fails before the fix.

## Checklist

- [ ] Feature module follows existing project structure.
- [ ] Controller has no business logic.
- [ ] Request DTOs validate all external input.
- [ ] Response does not expose raw Prisma model data or sensitive columns.
- [ ] Dynamic sort fields are whitelisted.
- [ ] Multi-table writes run in a transaction.
- [ ] Redis cache has TTL and invalidation.
- [ ] Tests cover success and important failure cases.
