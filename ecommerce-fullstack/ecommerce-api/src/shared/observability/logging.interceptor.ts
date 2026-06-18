import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { type Observable, tap } from 'rxjs';
import { logStructured } from './structured-log.util';

const SKIPPED_PATHS = new Set(['/metrics', '/api/docs']);

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const path = request.route?.path ?? request.url?.split('?')[0] ?? '/';

    if (SKIPPED_PATHS.has(path)) {
      return next.handle();
    }

    const startedAt = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => {
          logStructured(this.logger, 'log', 'HTTP request completed', {
            method: request.method,
            path,
            status: response.statusCode,
            duration_ms: Math.round(
              Number(process.hrtime.bigint() - startedAt) / 1_000_000,
            ),
          });
        },
        error: () => {
          logStructured(this.logger, 'error', 'HTTP request failed', {
            method: request.method,
            path,
            status: response.statusCode || 500,
            duration_ms: Math.round(
              Number(process.hrtime.bigint() - startedAt) / 1_000_000,
            ),
          });
        },
      }),
    );
  }
}
