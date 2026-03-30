import { ulid } from 'ulid';

/**
 * Generate a new ULID string.
 */
export function generateUlid(): string {
  return ulid();
}

/**
 * Validate that a string is a valid ULID.
 * ULID: 26 characters, Crockford Base32 encoding.
 */
export function validateUlid(id: string): boolean {
  if (typeof id !== 'string' || id.length !== 26) {
    return false;
  }
  // Crockford Base32 character set
  const crockfordBase32 = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
  return crockfordBase32.test(id);
}
