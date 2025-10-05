import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();

    if (users.length == 0) {
      throw new NotFoundException('No user exists');
    }

    return users;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { id },
    });

    if (user == null) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({ data: createUserDto });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return user;
  }

  async remove(id: number) {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      console.error(error);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
