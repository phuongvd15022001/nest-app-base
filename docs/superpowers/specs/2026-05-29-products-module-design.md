# Products Module Design

**Date:** 2026-05-29  
**Status:** Approved

## Overview

Add a `ProductsModule` to the NestJS base template, mirroring the existing `UsersModule` structure. The module exposes CRUD endpoints for the `Product` Prisma model with public reads and authenticated owner/admin writes.

## Requirements

- Public (no auth) read endpoints: list all products with optional `?userId` filter, get single product by ID
- Authenticated write endpoints: create (any logged-in user, product assigned to self), update and delete (owner only or ADMIN role)
- Ownership check: `PUT`/`DELETE` throws `ForbiddenException` if `currentUser.id !== product.userId` and `currentUser.role !== ADMIN`
- Pagination + search on list endpoint (consistent with `UsersModule`)
- Full Swagger documentation on all endpoints

## Endpoints

| Method | Path | Auth | Guard | Notes |
|--------|------|------|-------|-------|
| GET | `/products` | None | `@Roles(ERole.PUBLIC)` | Paginated; optional `?userId=123`, `?search=` |
| GET | `/products/:id` | None | `@Roles(ERole.PUBLIC)` | Returns `ProductWithUserResponseDto` |
| POST | `/products` | JWT | `@Roles(ERole.USER)` | `userId` taken from JWT payload |
| PUT | `/products/:id` | JWT | `@Roles(ERole.USER)` | Owner or ADMIN only |
| DELETE | `/products/:id` | JWT | `@Roles(ERole.USER)` | Owner or ADMIN only, HTTP 204 |

## Architecture

### File Structure

```
src/
├── shared/
│   └── decorators/
│       └── current-user.decorator.ts       NEW — extract user from JWT
├── modules/
│   └── products/
│       ├── dto/
│       │   ├── product.response.dto.ts      UPDATE — add ProductWithUserResponseDto
│       │   ├── create-product.dto.ts        NEW
│       │   ├── update-product.dto.ts        NEW
│       │   └── get-list-products.dto.ts     NEW
│       ├── products.repository.ts           NEW
│       ├── products.service.ts              NEW
│       ├── products.controller.ts           NEW
│       └── products.module.ts               NEW
└── app.module.ts                            UPDATE — import ProductsModule
```

### DTOs

**`CreateProductDto`**: `name` (required, StringField), `description` (optional, StringField), `price` (required, NumberField min:0)

**`UpdateProductDto`**: all fields from CreateProductDto but optional (`IsOptional`)

**`GetListProductsDto`**: extends `BasePaginationDto`, adds optional `userId?: number` (`@Type(() => Number)`)

**`ProductResponseDto`** (existing): `id`, `name`, `description?`, `price` — all `@Expose()`

**`ProductWithUserResponseDto`** (new, extends ProductResponseDto): adds `user?: UserResponseDto` with `@Type(() => UserResponseDto)`

### Repository

`ProductsRepository` mirrors `UsersRepository`:
- `findAll(params)` — `findMany` with skip/take/orderBy/where/select
- `count(params)` — `count` with where
- `findOne(params)` — `findUnique` with whereUniqueInput + optional include
- `create(params)` — `create` with `Prisma.ProductUncheckedCreateInput`
- `update(params)` — `update`
- `delete(params)` — `delete`

### Service

**`findAll`**: transforms pagination query against `Prisma.ProductScalarFieldEnum`, applies `where.name` contains search, applies `where.userId` if provided, returns `BasePaginationResponseDto`.

**`findOne`**: finds by id with user include, throws `NotFoundException` if not found.

**`create`**: receives `CreateProductDto` + `userId` (from controller via `@CurrentUser()`), creates product.

**`update`**: loads product, checks ownership (`product.userId !== userId && role !== ADMIN`) → `ForbiddenException`, then updates.

**`remove`**: loads product, same ownership check, then deletes.

### Controller

Uses `@Roles(ERole.PUBLIC)` + `@UseGuards(JwtAuthGuard)` for read endpoints (guard returns true for PUBLIC). Uses `@Roles(ERole.USER)` + `@UseGuards(JwtAuthGuard)` for write endpoints. Injects `@CurrentUser()` on write endpoints to pass `userId` and `role` to service.

### `@CurrentUser()` Decorator

```typescript
// Returns the user object set by JwtStrategy.validate: { id, email, name }
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

Note: JWT strategy returns `id` as `payload.sub` (string). Service must cast to `Number(userId)` when comparing with `product.userId` (number).

### AppModule

Add `ProductsModule` to the `imports` array in `app.module.ts`.

## Authorization Logic

```
POST /products
  → userId = currentUser.id (from JWT)
  → create product with that userId

PUT|DELETE /products/:id
  → load product (throw NotFoundException if missing)
  → if product.userId !== Number(currentUser.id) AND currentUser.role !== ADMIN
       throw ForbiddenException('You are not allowed to modify this product')
  → proceed with update/delete
```

Note: `JwtStrategy.validate` currently returns `{ id, email, name }` without `role`, even though `role` is already present in the JWT payload (set in `auth.service.ts`). The fix is a one-line change in `jwt.strategy.ts`: add `role: payload.role` to the return object. This change is required before ownership/admin checks will work correctly.

## Error Handling

| Scenario | Exception |
|----------|-----------|
| Product not found | `NotFoundException` |
| Not owner and not ADMIN | `ForbiddenException` |
| Invalid input | `ValidationPipe` (global) → `InvalidFormException` |

## Testing

- Unit tests: `products.service.spec.ts` — mock repository, cover all CRUD cases + ownership checks
- Controller tests: `products.controller.spec.ts` — verify route guards and response shape
