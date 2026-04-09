import { ArgumentMetadata, ParseEnumPipe } from '@nestjs/common';

export class OptionalParseEnumPipe<T = any> extends ParseEnumPipe<T> {
  override transform(value: T, metadata: ArgumentMetadata): Promise<T> {
    if (value === undefined) {
      return Promise.resolve(value);
    }
    return super.transform(value, metadata);
  }
}
