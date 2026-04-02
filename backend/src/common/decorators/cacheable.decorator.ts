import { Inject } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Token de inject Redis client vao CacheService.
 * Module can register: { provide: REDIS_CLIENT, useFactory: ... }
 */
export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * Inject Redis client decorator.
 * Usage: constructor(@InjectRedis() private redis: Redis) {}
 */
export const InjectRedis = () => Inject(REDIS_CLIENT);

/**
 * @Cacheable decorator — cache ket qua method trong Redis.
 *
 * Yeu cau: class phai co property `redisClient: Redis` (inject qua constructor).
 *
 * Usage:
 * @Cacheable({ key: 'categories:tree', ttl: 300 })
 * async getCategoryTree() { ... }
 *
 * @Cacheable({ key: (args) => `product:${args[0]}`, ttl: 3600 })
 * async findBySlug(slug: string) { ... }
 *
 * @param options.key - Cache key (string hoac function nhan args tra ve key)
 * @param options.ttl - Time-to-live in seconds (default 300 = 5 min)
 */
export function Cacheable(options: {
  key: string | ((...args: unknown[]) => string);
  ttl?: number;
}): MethodDecorator {
  const { key, ttl = 300 } = options;

  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const redis: Redis | undefined = (this as any).redisClient;
      if (!redis) {
        // Khong co Redis -> fallback chay method goc
        return originalMethod.apply(this, args);
      }

      const cacheKey = typeof key === 'function' ? key(...args) : key;

      try {
        // Check cache
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {
        // Redis error -> fallback
      }

      // Execute method
      const result = await originalMethod.apply(this, args);

      // Save to cache (fire-and-forget)
      try {
        await redis.setex(cacheKey, ttl, JSON.stringify(result));
      } catch {
        // Redis error -> skip cache
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * @CacheEvict decorator — xoa cache key sau khi method chay.
 * Dung cho create/update/delete methods.
 *
 * Usage:
 * @CacheEvict({ key: 'categories:tree' })
 * async updateCategory(id, data) { ... }
 *
 * @CacheEvict({ pattern: 'product:*' })
 * async clearProductCache() { ... }
 */
export function CacheEvict(options: {
  key?: string | string[];
  pattern?: string;
}): MethodDecorator {
  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const result = await originalMethod.apply(this, args);

      const redis: Redis | undefined = (this as any).redisClient;
      if (!redis) return result;

      try {
        if (options.key) {
          const keys = Array.isArray(options.key) ? options.key : [options.key];
          if (keys.length > 0) {
            await redis.del(...keys);
          }
        }

        if (options.pattern) {
          const matchedKeys = await redis.keys(options.pattern);
          if (matchedKeys.length > 0) {
            await redis.del(...matchedKeys);
          }
        }
      } catch {
        // Redis error -> skip eviction
      }

      return result;
    };

    return descriptor;
  };
}
