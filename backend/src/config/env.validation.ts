/**
 * Validate required environment variables at startup.
 * Fails fast with a clear error if any critical env var is missing.
 */
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

  // Warn about default/insecure values in production
  if (process.env.NODE_ENV === 'production') {
    if (
      process.env.JWT_SECRET === 'your-secret-key-change-in-production'
    ) {
      console.error(
        '[ENV] CRITICAL: JWT_SECRET is set to the default value in production!',
      );
      process.exit(1);
    }
  }
}
