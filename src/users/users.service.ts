import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User {
    const user = this.users.find((item) => item.id === id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  create(createUserDto: CreateUserDto): User {
    const user: User = { id: this.idCounter++, ...createUserDto };
    this.users.push(user);
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto): User {
    const user = this.findOne(id);
    Object.assign(user, updateUserDto);
    return user;
  }

  remove(id: number): void {
    const idx = this.users.findIndex((item) => item.id === id);

    if (idx === -1) {
      throw new NotFoundException('User not found');
    }

    this.users.splice(idx, 1);
  }
}
