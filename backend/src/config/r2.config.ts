import { registerAs } from '@nestjs/config';

export const r2Config = registerAs('r2', () => ({
  accountId: process.env.R2_ACCOUNT_ID || '',
  accessKey: process.env.R2_ACCESS_KEY || '',
  secretKey: process.env.R2_SECRET_KEY || '',
  bucketPrivate: process.env.R2_BUCKET_PRIVATE || 'vietnet-private',
  bucketPublic: process.env.R2_BUCKET_PUBLIC || 'vietnet-public',
  publicUrl: process.env.R2_PUBLIC_URL || '',
}));
