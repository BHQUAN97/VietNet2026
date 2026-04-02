import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../decorators/cacheable.decorator';

/**
 * Global Redis module — cung cap Redis client cho toan bo app.
 * Thay the pattern tao new Redis() trong tung service.
 *
 * Usage trong service:
 * constructor(@InjectRedis() private readonly redisClient: Redis) {}
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('redis.host', 'localhost');
        const port = configService.get<number>('redis.port', 6379);

        const client = new Redis({
          host,
          port,
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => {
            if (times > 3) return null;
            return Math.min(times * 200, 2000);
          },
        });

        client.on('error', (err: Error) => {
          console.error('Redis connection error:', err.message);
        });

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
