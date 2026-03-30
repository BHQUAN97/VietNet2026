import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: parseInt(process.env.JWT_EXPIRATION || '3600', 10),
  refreshExpiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRATION || '604800', 10),
}));
