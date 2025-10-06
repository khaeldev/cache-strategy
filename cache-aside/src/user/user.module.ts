import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CacheService } from 'src/cache/cache.service';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  imports: [
    // In memeory-cache
    // CacheModule.register({isGlobal: true})],
    CacheModule
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
