
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from 'src/cache/cache.service';

const mockUserData = [
  {
    id: 1,
    name: 'John Doe',
  },
  {
    id: 2,
    name: 'Jane Smith',
  },
]
@Injectable()
export class UserService {
  constructor(
    // In memory-cache
    //@Inject(CACHE_MANAGER) private cacheManager: Cache,
    
    // Redis cache moduile
    private cacheManager: CacheService,
  ) {}

  async findOne(id: number) {
    let user: object | null = null;

    const cacheKey = `user_${id}`;

    console.time('Buscando usuario en caché');
    const cachedUser = await this.cacheManager.get(cacheKey);
    console.timeEnd('Buscando usuario en caché');

    if (!cachedUser) {
      console.time('Buscando usuario en la base de datos');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simula una consulta a la base de datos
      
      user = mockUserData.find(user => user.id === id) || null;
      
      console.timeEnd('Buscando usuario en la base de datos');
      if (user) {
        await this.cacheManager.set(cacheKey, user, 1000 * 60); // TTL de 60 segundos
      }
    } else {
      console.log('Usuario encontrado en caché');
      user = cachedUser;
    }

    return user;
  }
}
