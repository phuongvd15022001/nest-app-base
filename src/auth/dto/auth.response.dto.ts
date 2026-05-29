import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ERole } from 'src/shared/constants/global.constants';

class AuthPayloadDto {
  @ApiProperty()
  @Expose()
  sub: number;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ enum: ERole })
  @Expose()
  role: ERole;
}

export class AuthResponseDto {
  @ApiProperty({ type: AuthPayloadDto })
  @Expose()
  @Type(() => AuthPayloadDto)
  payload: AuthPayloadDto;

  @ApiProperty()
  @Expose()
  accessToken: string;

  @ApiProperty()
  @Expose()
  refreshToken: string;
}
