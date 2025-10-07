import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaListener } from './prisma.listener';
import { UserListener } from 'src/modules/users/users.listener';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma');

    this.$use(PrismaListener.onDeleted);
    this.$use(PrismaListener.onFind);
    this.$use(UserListener.onCreated);
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❎ Prisma disconnected');
  }
}
