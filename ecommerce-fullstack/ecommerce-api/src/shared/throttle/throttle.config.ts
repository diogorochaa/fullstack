import { registerAs } from '@nestjs/config';

export default registerAs('throttle', () => ({
  ttl: Number(process.env.THROTTLE_TTL ?? 60_000),
  limit: Number(process.env.THROTTLE_LIMIT ?? 100),
  loginLimit: Number(process.env.THROTTLE_LOGIN_LIMIT ?? 5),
}));
