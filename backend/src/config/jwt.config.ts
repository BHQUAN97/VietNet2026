import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required. Application cannot start without it.');
  }

  return {
    secret,
    expiresIn: parseInt(process.env.JWT_EXPIRATION || '3600', 10),
    refreshExpiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRATION || '604800', 10),
  };
});
