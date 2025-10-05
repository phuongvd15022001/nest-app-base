import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloService } from './hello/hello.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import Joi from 'joi';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
      }),
    }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService, HelloService],
})
export class AppModule {}
