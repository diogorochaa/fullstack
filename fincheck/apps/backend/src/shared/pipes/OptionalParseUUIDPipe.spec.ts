import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { OptionalParseUUIDPipe } from './OptionalParseUUIDPipe';

describe('OptionalParseUUIDPipe', () => {
  const pipe = new OptionalParseUUIDPipe();

  it('passes through undefined and null values', async () => {
    await expect(
      pipe.transform(undefined as never, { type: 'query' } as never),
    ).resolves.toBeUndefined();
    await expect(
      pipe.transform(null as never, { type: 'query' } as never),
    ).resolves.toBeNull();
  });

  it('accepts valid uuid values', async () => {
    await expect(
      pipe.transform('17d9d0e9-b198-43f9-b32f-13f57f4f6fd7', {
        type: 'query',
      } as never),
    ).resolves.toBe('17d9d0e9-b198-43f9-b32f-13f57f4f6fd7');
  });

  it('rejects invalid uuid values', async () => {
    await expect(
      pipe.transform('not-a-uuid', { type: 'query' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
