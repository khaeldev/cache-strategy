import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service'; // Asumiendo el uso de Prisma

@Injectable()
export class ProductService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService, // El servicio de base de datos
  ) {}

  /**
   * Este método actúa como la interfaz de la caché Read-Through.
   * El controlador solo llama a este método, desconociendo la existencia de la BD.
   */
  async findOne(id: number) {
    const cacheKey = `product_${id}`;
    // 1. La aplicación solicita el dato directamente a la "caché" (nuestro servicio)
    const cachedProduct = await this.cacheManager.get(cacheKey);

    if (cachedProduct) {
      // 2. Cache Hit: El dato se encuentra y se devuelve.
      console.log('Retornando producto desde la caché (Read-Through)');
      return cachedProduct;
    }

    // 3. Cache Miss: La propia capa de caché se encarga de buscar en la BD.
    console.log('Cache miss. Buscando producto en la base de datos...');
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (product) {
      // 3b. La caché almacena el nuevo dato.
      console.log('Almacenando producto en la caché.');
      await this.cacheManager.set(cacheKey, product, 120); // TTL de 120 segundos
    }

    // 3c. La caché devuelve el dato a la aplicación.
    return product;
  }
}