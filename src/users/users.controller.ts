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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user.response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // GET /users
  @Get()
  findAll(@Query('search') search?: string) {
    const users = this.userService.findAll();

    if (!search) {
      return users;
    }

    const q = search.toLowerCase();
    const newUsers = users.filter((user) =>
      user.name.toLowerCase().includes(q),
    );

    return newUsers;
  }

  // GET /users/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): UserResponseDto {
    const user = this.userService.findOne(id);

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // POST /users
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // PUT /users/:id
  @Put(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  // DELETE /users/:id
  @Delete(':id')
  @HttpCode(204)
  removeUser(@Param('id', ParseIntPipe) id: number) {
    this.userService.remove(id);
    return;
  }
}
