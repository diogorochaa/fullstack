import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { OptionalParseEnumPipe } from './OptionalParseEnumPipe';

enum FilterType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

describe('OptionalParseEnumPipe', () => {
  const pipe = new OptionalParseEnumPipe(FilterType);

  it('passes through undefined values', async () => {
    await expect(
      pipe.transform(undefined as never, { type: 'query' } as never),
    ).resolves.toBeUndefined();
  });

  it('accepts valid enum values', async () => {
    await expect(
      pipe.transform('INCOME' as never, { type: 'query' } as never),
    ).resolves.toBe('INCOME');
  });

  it('rejects invalid enum values', async () => {
    await expect(
      pipe.transform('invalid' as never, { type: 'query' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
