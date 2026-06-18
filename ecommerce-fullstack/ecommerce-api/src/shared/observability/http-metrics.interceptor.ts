import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Counter, Histogram } from 'prom-client';
import { type Observable, tap } from 'rxjs';

const SKIPPED_PATHS = new Set(['/metrics', '/api/docs']);

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  private readonly requestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'],
  });

  private readonly requestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  });

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const route = this.resolveRoute(request);

    if (SKIPPED_PATHS.has(route)) {
      return next.handle();
    }

    const startedAt = process.hrtime.bigint();
    const method = request.method;

    return next.handle().pipe(
      tap({
        next: () => this.record(method, route, response.statusCode, startedAt),
        error: () => this.record(method, route, response.statusCode || 500, startedAt),
      }),
    );
  }

  private record(
    method: string,
    route: string,
    status: number,
    startedAt: bigint,
  ): void {
    const statusLabel = String(status || 500);
    const durationSeconds =
      Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;

    this.requestsTotal.inc({ method, route, status: statusLabel });
    this.requestDuration.observe(
      { method, route, status: statusLabel },
      durationSeconds,
    );
  }

  private resolveRoute(request: Request): string {
    const routePath = request.route?.path;
    if (typeof routePath === 'string') {
      return routePath;
    }

    const url = request.url?.split('?')[0] ?? '/';
    return url || '/';
  }
}
