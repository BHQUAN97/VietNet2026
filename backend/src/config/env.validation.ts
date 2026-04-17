/**
 * Validate required environment variables at startup.
 * Fails fast with a clear error if any critical env var is missing or insecure.
 */

// Cac gia tri placeholder trong .env.example KHONG duoc phep dung lam JWT_SECRET that
const INSECURE_JWT_SECRETS = new Set<string>([
  'your-secret-key-change-in-production',
  'generate-with-openssl-rand-base64-32',
  'change-me-in-local-env',
  'secret',
  'jwt_secret',
  'changeme',
]);

const MIN_JWT_SECRET_LENGTH = 32;

export function validateEnv(): void {
  const required: string[] = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
    'REDIS_HOST',
    'JWT_SECRET',
  ];

  const missing = required.filter(
    (key) => !process.env[key] || process.env[key] === '',
  );

  if (missing.length > 0) {
    console.error(
      `[ENV] Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}`,
    );
    console.error('[ENV] Check your .env file or Docker environment.');
    process.exit(1);
  }

  const jwtSecret = process.env.JWT_SECRET as string;

  // Strict check: KHONG duoc dung placeholder tu .env.example
  if (INSECURE_JWT_SECRETS.has(jwtSecret)) {
    console.error(
      '[ENV] CRITICAL: JWT_SECRET is set to a placeholder value from .env.example.',
    );
    console.error(
      '[ENV] Generate a secure secret with: openssl rand -base64 32',
    );
    process.exit(1);
  }

  // Strict check: min length 32 chars
  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    console.error(
      `[ENV] CRITICAL: JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long ` +
        `(current: ${jwtSecret.length}).`,
    );
    console.error(
      '[ENV] Generate a secure secret with: openssl rand -base64 32',
    );
    process.exit(1);
  }

  // Production-only: stricter warnings (redundant with above but explicit)
  if (process.env.NODE_ENV === 'production') {
    if (INSECURE_JWT_SECRETS.has(jwtSecret)) {
      console.error(
        '[ENV] CRITICAL: JWT_SECRET is set to a default/placeholder value in production!',
      );
      process.exit(1);
    }
  }
}
