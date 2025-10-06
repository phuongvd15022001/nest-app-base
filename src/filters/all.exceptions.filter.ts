import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = (() => {
      if (exception instanceof HttpException) {
        const response = exception.getResponse();
        return typeof response === 'string' ? { message: response } : response;
      }

      if (exception instanceof Error) {
        return { message: exception.message };
      }

      return { message: 'Internal server error' };
    })();

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
