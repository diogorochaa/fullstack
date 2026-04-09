import { ArgumentMetadata, ParseUUIDPipe } from '@nestjs/common';

export class OptionalParseUUIDPipe extends ParseUUIDPipe {
  override transform(
    value: string,
    metadata: ArgumentMetadata,
  ): Promise<string> {
    if (value === undefined || value === null) {
      return Promise.resolve(value);
    }
    return super.transform(value, metadata);
  }
}
