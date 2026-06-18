import { Logger } from '@nestjs/common';

type StructuredLogFields = Record<string, string | number | boolean | null>;

export function logStructured(
  logger: Logger,
  level: 'log' | 'warn' | 'error' | 'debug',
  message: string,
  fields: StructuredLogFields = {},
): void {
  const payload = JSON.stringify({
    level,
    service: 'ecommerce-api',
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  });

  logger[level](payload);
}
