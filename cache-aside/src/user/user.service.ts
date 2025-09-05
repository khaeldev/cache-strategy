/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
  ) {}

  async findOne(id: number) {
    let user: object | null = null;

    const cacheKey = `user_${id}`;
    const cachedUser = await this.cacheManager.get<object>(cacheKey);

    if (!cachedUser) {
      console.log('Buscando usuario en la base de datos');
      user = await this.prisma.user.findUnique({ where: { id } });

      if (user) {
        await this.cacheManager.set(cacheKey, user, 60); // TTL de 60 segundos
      }
    } else {
      console.log('Usuario encontrado en caché');
      user = cachedUser;
    }

    return user;
  }
}
