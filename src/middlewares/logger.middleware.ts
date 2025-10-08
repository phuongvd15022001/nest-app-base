import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      `[API Request] [${new Date().toISOString()}] ${req.method} ${req.originalUrl}: ${JSON.stringify(req.body)}`,
    );
    next();
  }
}
