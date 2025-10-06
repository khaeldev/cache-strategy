import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { CacheModule } from './cache/cache.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule,
    UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
