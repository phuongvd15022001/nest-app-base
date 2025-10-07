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
import {
  UserResponseDto,
  UserWithProductResponseDto,
} from './dto/user.response.dto';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { GetListUsersDto } from './dto/get-list-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BasePaginationResponseDto } from 'src/shared/dtos/base-pagination.response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // GET /users
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    type: BasePaginationResponseDto.apiOKResponse(UserResponseDto),
  })
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  findAll(@Query() getListUsersDto: GetListUsersDto) {
    return this.userService.findAll({ getListUsersDto });
  }

  // GET /users/:id
  @UseInterceptors(new TransformInterceptor(UserWithProductResponseDto))
  @Get(':id')
  @ApiOperation({ summary: 'Get detail user' })
  @ApiOkResponse({ type: UserWithProductResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // POST /users
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiOkResponse({ type: UserResponseDto })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // PUT /users/:id
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ type: UserResponseDto })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  // DELETE /users/:id
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @HttpCode(204)
  removeUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
