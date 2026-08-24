import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product, User } from '@prisma/client';
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
      ...(getListProductsDto.userId
        ? { userId: getListProductsDto.userId }
        : {}),
    };

    const [products, total] = await Promise.all([
      this.productsRepository.findAll({
        take,
        skip,
        orderBy: sortByField,
        where,
      }),
      this.productsRepository.count({ where }),
    ]);

    return BasePaginationResponseDto.convertToPaginationResponse(
      [products, products.length],
      getListProductsDto.page,
      total,
    );
  }

  async findOne(id: number) {
    const product = (await this.productsRepository.findOne({
      whereUniqueInput: { id },
      includes: { user: true },
    })) as (Product & { user?: User | null }) | null;

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // `user` is a required to-one relation, so Prisma cannot filter it inside
    // `include`, and the soft-delete middleware does not reach nested reads.
    // Drop the owner rather than the product: the product itself is still live.
    if (product.user?.deletedAt) {
      return { ...product, user: undefined };
    }

    return product;
  }

  async create(createProductDto: CreateProductDto, userId: number) {
    return this.productsRepository.create({
      data: { ...createProductDto, userId },
    });
  }

  async createMany(
    items: CreateProductDto[],
    userId: number,
  ): Promise<{ count: number }> {
    return this.productsRepository.createMany({
      data: items.map((item) => ({ ...item, userId })),
    });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    currentUser: { id: string; role: ERole },
  ) {
    const product = await this.productsRepository.findOne({
      whereUniqueInput: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (
      product.userId !== Number(currentUser.id) &&
      currentUser.role !== ERole.ADMIN
    ) {
      throw new ForbiddenException(
        'You are not allowed to modify this product',
      );
    }

    return this.productsRepository.update({
      whereUniqueInput: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number, currentUser: { id: string; role: ERole }) {
    const product = await this.productsRepository.findOne({
      whereUniqueInput: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (
      product.userId !== Number(currentUser.id) &&
      currentUser.role !== ERole.ADMIN
    ) {
      throw new ForbiddenException(
        'You are not allowed to modify this product',
      );
    }

    await this.productsRepository.delete({ whereUniqueInput: { id } });
  }
}
