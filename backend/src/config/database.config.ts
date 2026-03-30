import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || process.env.DB_USER || 'vietnet',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || 'vietnet_dev',
  name: process.env.DB_NAME || 'vietnet',
}));
