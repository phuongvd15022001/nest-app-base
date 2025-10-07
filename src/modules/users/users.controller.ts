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
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user.response.dto';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { GetListUsersDto } from './dto/get-list-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // GET /users
  @Get()
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  findAll(@Query() getListUsersDto: GetListUsersDto) {
    return this.userService.findAll({ getListUsersDto });
  }

  // GET /users/:id
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
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
    return this.userService.remove(id);
  }
}
