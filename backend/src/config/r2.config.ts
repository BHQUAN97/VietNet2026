import { registerAs } from '@nestjs/config';

export const r2Config = registerAs('r2', () => ({
  // Hỗ trợ cả 2 pattern env var: R2_ACCESS_KEY hoặc R2_ACCESS_KEY_ID
  endpoint: process.env.R2_ENDPOINT || '',
  accountId: process.env.R2_ACCOUNT_ID || '',
  accessKey: process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY || '',
  secretKey: process.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_KEY || '',
  bucketPrivate: process.env.R2_BUCKET_PRIVATE || 'vietnet-private',
  bucketPublic: process.env.R2_BUCKET_PUBLIC || 'vietnet-public',
  publicUrl: process.env.R2_PUBLIC_URL || '',
}));
