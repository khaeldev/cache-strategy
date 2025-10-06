import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import KeyvRedis, { createKeyv, Keyv } from '@keyv/redis';
import { CacheService } from './cache.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    NestCacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL', 'redis://localhost:6379');

        // Configuración del store con Keyv + Redis
        const store = new Keyv({
          store: new KeyvRedis(redisUrl),
        });
        await store.set('connection_test', 'ok');
        const value = await store.get('connection_test');
        console.log('Redis test value:', value); // debería ser 'ok'
        
        return {
          store,
          ttl: configService.get<number>('CACHE_TTL', 1000 * 60), // seconds
        }
      },

    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule { }