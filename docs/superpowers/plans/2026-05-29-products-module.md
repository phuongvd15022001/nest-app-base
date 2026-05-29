# Products Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fully working `ProductsModule` with CRUD endpoints (public read, authenticated owner/admin write) mirroring the existing `UsersModule` pattern.

**Architecture:** Repository → Service → Controller stack, identical to `UsersModule`. A new `@CurrentUser()` decorator extracts the authenticated user from the JWT payload. Ownership checks live in the service layer and throw `ForbiddenException` when a non-owner non-admin attempts to write.

**Tech Stack:** NestJS 11, Prisma ORM, class-validator, class-transformer, Passport JWT, Jest

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/auth/strategies/jwt.strategy.ts` |
| Create | `src/shared/decorators/current-user.decorator.ts` |
| Modify | `src/modules/products/dto/product.response.dto.ts` |
| Create | `src/modules/products/dto/create-product.dto.ts` |
| Create | `src/modules/products/dto/update-product.dto.ts` |
| Create | `src/modules/products/dto/get-list-products.dto.ts` |
| Create | `src/modules/products/products.repository.ts` |
| Create | `src/modules/products/products.service.ts` |
| Create | `src/modules/products/products.service.spec.ts` |
| Create | `src/modules/products/products.controller.ts` |
| Create | `src/modules/products/products.module.ts` |
| Modify | `src/app.module.ts` |

---

## Task 1: Fix JwtStrategy to expose `role` in `request.user`

The JWT payload already contains `role` (set in `auth.service.ts:34`) but `JwtStrategy.validate` currently returns only `{ id, email, name }`. Ownership checks need `role`.

**Files:**
- Modify: `src/auth/strategies/jwt.strategy.ts`

- [ ] **Step 1: Open `jwt.strategy.ts` and update the `validate` return value**

Replace the current return statement (line 34) with:

```typescript
return { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
```

Full updated `validate` method:

```typescript
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

  return { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
}
```

- [ ] **Step 2: Run existing tests to confirm nothing regressed**

```bash
npm test -- --testPathPattern="auth"
```

Expected: all auth tests pass (or no auth tests exist — that is fine too).

- [ ] **Step 3: Commit**

```bash
git add src/auth/strategies/jwt.strategy.ts
git commit -m "fix(auth): expose role in JWT request.user"
```

---

## Task 2: Create `@CurrentUser()` param decorator

**Files:**
- Create: `src/shared/decorators/current-user.decorator.ts`

- [ ] **Step 1: Create the decorator file**

```typescript
// src/shared/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/decorators/current-user.decorator.ts
git commit -m "feat(shared): add CurrentUser param decorator"
```

---

## Task 3: Create DTOs

**Files:**
- Modify: `src/modules/products/dto/product.response.dto.ts`
- Create: `src/modules/products/dto/create-product.dto.ts`
- Create: `src/modules/products/dto/update-product.dto.ts`
- Create: `src/modules/products/dto/get-list-products.dto.ts`

- [ ] **Step 1: Update `product.response.dto.ts` — add `ProductWithUserResponseDto`**

Replace the entire file content with:

```typescript
// src/modules/products/dto/product.response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/modules/users/dto/user.response.dto';

export class ProductResponseDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Chicken', description: 'Product Name' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: 'Fresh whole chicken', description: 'Product Description' })
  @Expose()
  description?: string;

  @ApiProperty({ example: 9.99, description: 'Product Price' })
  @Expose()
  price: number;
}

export class ProductWithUserResponseDto extends ProductResponseDto {
  @ApiPropertyOptional({ type: UserResponseDto, description: 'Product owner' })
  @Expose()
  @Type(() => UserResponseDto)
  user?: UserResponseDto;
}
```

- [ ] **Step 2: Create `create-product.dto.ts`**

```typescript
// src/modules/products/dto/create-product.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { NumberField, StringField } from 'src/shared/decorators/dto.decorators';

export class CreateProductDto {
  @StringField({ optional: false }, { min: 1, max: 100 })
  name: string;

  @ApiPropertyOptional({ example: 'Fresh whole chicken', description: 'Product Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @NumberField({ optional: false, min: 0 })
  price: number;
}
```

- [ ] **Step 3: Create `update-product.dto.ts`**

```typescript
// src/modules/products/dto/update-product.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Chicken', description: 'Product Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Fresh whole chicken', description: 'Product Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 9.99, description: 'Product Price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
```

- [ ] **Step 4: Create `get-list-products.dto.ts`**

```typescript
// src/modules/products/dto/get-list-products.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { BasePaginationDto } from 'src/shared/dtos/base-pagination.dto';

export class GetListProductsDto extends BasePaginationDto {
  @ApiPropertyOptional({ example: 1, description: 'Filter by user ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/products/dto/
git commit -m "feat(products): add DTOs and update response DTO"
```

---

## Task 4: Create `ProductsRepository`

**Files:**
- Create: `src/modules/products/products.repository.ts`

`PrismaModule` is `@Global()` so `PrismaService` is available without explicit import in the module.

- [ ] **Step 1: Create `products.repository.ts`**

```typescript
// src/modules/products/products.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    select?: Prisma.ProductSelect;
  }): Promise<Product[]> {
    const { skip, take, cursor, where, orderBy, select } = params;
    return this.prisma.product.findMany({ skip, take, cursor, where, orderBy, select });
  }

  async count(params: { where?: Prisma.ProductWhereInput }): Promise<number> {
    return this.prisma.product.count({ where: params.where });
  }

  async findOne(params: {
    whereUniqueInput: Prisma.ProductWhereUniqueInput;
    includes?: Prisma.ProductInclude;
  }): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: params.whereUniqueInput,
      include: params.includes,
    });
  }

  async create(params: { data: Prisma.ProductUncheckedCreateInput }): Promise<Product> {
    return this.prisma.product.create({ data: params.data });
  }

  async update(params: {
    whereUniqueInput: Prisma.ProductWhereUniqueInput;
    data: Prisma.ProductUncheckedUpdateInput;
  }): Promise<Product> {
    return this.prisma.product.update({ data: params.data, where: params.whereUniqueInput });
  }

  async delete(params: {
    whereUniqueInput: Prisma.ProductWhereUniqueInput;
  }): Promise<Product> {
    return this.prisma.product.delete({ where: params.whereUniqueInput });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/products/products.repository.ts
git commit -m "feat(products): add ProductsRepository"
```

---

## Task 5: Create `ProductsService` with TDD

**Files:**
- Create: `src/modules/products/products.service.ts`
- Create: `src/modules/products/products.service.spec.ts`

- [ ] **Step 1: Write the failing test file**

```typescript
// src/modules/products/products.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { ERole } from 'src/shared/constants/global.constants';

const mockRepo = {
  findAll: jest.fn(),
  count: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('throws NotFoundException when product does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('returns product with user when found', async () => {
      const product = { id: 1, name: 'Chicken', price: 9.99, userId: 1, user: { id: 1, email: 'a@b.com', name: 'Alice' } };
      mockRepo.findOne.mockResolvedValue(product);
      await expect(service.findOne(1)).resolves.toEqual(product);
    });
  });

  describe('create', () => {
    it('creates product with the given userId', async () => {
      const dto = { name: 'Chicken', price: 9.99 };
      const created = { id: 1, ...dto, userId: 3, description: null };
      mockRepo.create.mockResolvedValue(created);
      const result = await service.create(dto as any, 3);
      expect(mockRepo.create).toHaveBeenCalledWith({ data: { ...dto, userId: 3 } });
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when product does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(
        service.update(999, {}, { id: '1', role: ERole.USER }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not owner and not ADMIN', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, userId: 2 });
      await expect(
        service.update(1, {}, { id: '5', role: ERole.USER }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('updates when current user is the owner', async () => {
      const product = { id: 1, userId: 3 };
      const updated = { id: 1, name: 'Updated', userId: 3, price: 5 };
      mockRepo.findOne.mockResolvedValue(product);
      mockRepo.update.mockResolvedValue(updated);
      await expect(
        service.update(1, { name: 'Updated' }, { id: '3', role: ERole.USER }),
      ).resolves.toEqual(updated);
    });

    it('updates when current user is ADMIN regardless of ownership', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, userId: 2 });
      mockRepo.update.mockResolvedValue({ id: 1, name: 'Updated', userId: 2, price: 5 });
      await expect(
        service.update(1, { name: 'Updated' }, { id: '99', role: ERole.ADMIN }),
      ).resolves.not.toThrow();
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when product does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(
        service.remove(999, { id: '1', role: ERole.USER }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not owner and not ADMIN', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, userId: 2 });
      await expect(
        service.remove(1, { id: '5', role: ERole.USER }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deletes when current user is the owner', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, userId: 3 });
      mockRepo.delete.mockResolvedValue({ id: 1 });
      await expect(
        service.remove(1, { id: '3', role: ERole.USER }),
      ).resolves.toBeUndefined();
      expect(mockRepo.delete).toHaveBeenCalledWith({ whereUniqueInput: { id: 1 } });
    });

    it('deletes when current user is ADMIN regardless of ownership', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, userId: 2 });
      mockRepo.delete.mockResolvedValue({ id: 1 });
      await expect(
        service.remove(1, { id: '99', role: ERole.ADMIN }),
      ).resolves.toBeUndefined();
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail (service doesn't exist yet)**

```bash
npm test -- --testPathPattern="products.service"
```

Expected: FAIL — "Cannot find module './products.service'"

- [ ] **Step 3: Create `products.service.ts`**

```typescript
// src/modules/products/products.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ERole } from 'src/shared/constants/global.constants';
import { BasePaginationResponseDto } from 'src/shared/dtos/base-pagination.response.dto';
import { CommonHelpers } from 'src/shared/helpers/common.helpers';
import { CreateProductDto } from './dto/create-product.dto';
import { GetListProductsDto } from './dto/get-list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private productsRepository: ProductsRepository) {}

  async findAll(params: { getListProductsDto: GetListProductsDto }) {
    const { getListProductsDto } = params;
    const { take, skip, sortByField } = CommonHelpers.transformPaginationQuery(
      getListProductsDto,
      Prisma.ProductScalarFieldEnum,
    );

    const where: Prisma.ProductWhereInput = {
      name: {
        contains: getListProductsDto.search,
        mode: Prisma.QueryMode.insensitive,
      },
      ...(getListProductsDto.userId ? { userId: getListProductsDto.userId } : {}),
    };

    const [products, total] = await Promise.all([
      this.productsRepository.findAll({ take, skip, orderBy: sortByField, where }),
      this.productsRepository.count({ where }),
    ]);

    return BasePaginationResponseDto.convertToPaginationResponse(
      [products, products.length],
      getListProductsDto.page,
      total,
    );
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({
      whereUniqueInput: { id },
      includes: { user: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(createProductDto: CreateProductDto, userId: number) {
    return this.productsRepository.create({
      data: { ...createProductDto, userId },
    });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    currentUser: { id: string; role: ERole },
  ) {
    const product = await this.productsRepository.findOne({ whereUniqueInput: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.userId !== Number(currentUser.id) && currentUser.role !== ERole.ADMIN) {
      throw new ForbiddenException('You are not allowed to modify this product');
    }

    return this.productsRepository.update({
      whereUniqueInput: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number, currentUser: { id: string; role: ERole }) {
    const product = await this.productsRepository.findOne({ whereUniqueInput: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.userId !== Number(currentUser.id) && currentUser.role !== ERole.ADMIN) {
      throw new ForbiddenException('You are not allowed to modify this product');
    }

    await this.productsRepository.delete({ whereUniqueInput: { id } });
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="products.service"
```

Expected: PASS — 8 tests in `ProductsService`

- [ ] **Step 5: Commit**

```bash
git add src/modules/products/products.service.ts src/modules/products/products.service.spec.ts
git commit -m "feat(products): add ProductsService with unit tests"
```

---

## Task 6: Create `ProductsController`

**Files:**
- Create: `src/modules/products/products.controller.ts`

- [ ] **Step 1: Create `products.controller.ts`**

```typescript
// src/modules/products/products.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { Roles } from 'src/auth/auth.roles.decorator';
import { ERole } from 'src/shared/constants/global.constants';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { BasePaginationResponseDto } from 'src/shared/dtos/base-pagination.response.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { ProductsService } from './products.service';
import { ProductResponseDto, ProductWithUserResponseDto } from './dto/product.response.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetListProductsDto } from './dto/get-list-products.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(ERole.PUBLIC)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(ProductResponseDto))
  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiOkResponse({ type: BasePaginationResponseDto.apiOKResponse(ProductResponseDto) })
  findAll(@Query() getListProductsDto: GetListProductsDto) {
    return this.productsService.findAll({ getListProductsDto });
  }

  @Roles(ERole.PUBLIC)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(ProductWithUserResponseDto))
  @Get(':id')
  @ApiOperation({ summary: 'Get product detail' })
  @ApiOkResponse({ type: ProductWithUserResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Roles(ERole.USER)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(ProductResponseDto))
  @Post()
  @ApiOperation({ summary: 'Create new product' })
  @ApiOkResponse({ type: ProductResponseDto })
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() currentUser: { id: string; role: ERole },
  ) {
    return this.productsService.create(createProductDto, Number(currentUser.id));
  }

  @Roles(ERole.USER)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(ProductResponseDto))
  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiOkResponse({ type: ProductResponseDto })
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() currentUser: { id: string; role: ERole },
  ) {
    return this.productsService.update(id, updateProductDto, currentUser);
  }

  @Roles(ERole.USER)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete product' })
  removeProduct(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: { id: string; role: ERole },
  ) {
    return this.productsService.remove(id, currentUser);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/products/products.controller.ts
git commit -m "feat(products): add ProductsController"
```

---

## Task 7: Create `ProductsModule` and register in `AppModule`

**Files:**
- Create: `src/modules/products/products.module.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Create `products.module.ts`**

```typescript
// src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';

@Module({
  providers: [ProductsService, ProductsRepository],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
```

Note: No need to import `PrismaModule` — it is `@Global()`.

- [ ] **Step 2: Register `ProductsModule` in `app.module.ts`**

Add the import at the top of `app.module.ts`:

```typescript
import { ProductsModule } from './modules/products/products.module';
```

Add `ProductsModule` to the `imports` array after `UsersModule`:

```typescript
imports: [
  // ... existing imports ...
  UsersModule,
  ProductsModule,   // add this line
  UploadsModule,
  // ...
],
```

- [ ] **Step 3: Build to verify no TypeScript errors**

```bash
npm run build
```

Expected: BUILD SUCCESS — no errors

- [ ] **Step 4: Run all tests**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add src/modules/products/products.module.ts src/app.module.ts
git commit -m "feat(products): register ProductsModule in AppModule"
```

---

## Task 8: Smoke test via Swagger

- [ ] **Step 1: Start the dev server**

```bash
npm run start:dev
```

Expected: server starts on configured `PORT` with no errors

- [ ] **Step 2: Open Swagger UI**

Navigate to `http://localhost:<PORT>/api/docs`

Verify the **products** tag appears with 5 endpoints:
- `GET /products`
- `GET /products/{id}`
- `POST /products`
- `PUT /products/{id}`
- `DELETE /products/{id}`

- [ ] **Step 3: Test `GET /products` without auth**

In Swagger, call `GET /products` without a Bearer token.

Expected: `200 OK` with `{ items: [], totalItems: 0, currentPage: undefined, allItems: 0 }`

- [ ] **Step 4: Test `POST /products` with auth**

Log in via `POST /auth/login` to get an access token. Authorize in Swagger. Then call `POST /products` with body:

```json
{ "name": "Test Product", "price": 19.99 }
```

Expected: `201` with `{ id: <n>, name: "Test Product", price: 19.99 }`

- [ ] **Step 5: Test `PUT /products/:id` with a different user's token**

Log in as a different user. Call `PUT /products/<id-from-step-4>` with:

```json
{ "name": "Hacked Name" }
```

Expected: `403 Forbidden` — "You are not allowed to modify this product"

- [ ] **Step 6: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix(products): smoke test fixes"
```

*(Skip this step if no fixes were needed.)*
