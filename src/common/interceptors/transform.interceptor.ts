import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { BasePaginationResponseDto } from 'src/shared/dtos/base-pagination.response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor {
  constructor(private readonly dto: new (...args: any[]) => T) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const paginatedData = data as BasePaginationResponseDto<T>;

        if (paginatedData.items && Array.isArray(paginatedData.items)) {
          return {
            ...paginatedData,
            items: plainToInstance(this.dto, paginatedData.items, {
              excludeExtraneousValues: true,
            }),
          };
        }

        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
