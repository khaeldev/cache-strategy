
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service'; // Asumiendo el uso de Prisma
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
  ) {}

  /**
   * Este método implementa la lógica de Write-Through.
   */
  async create(createOrderDto: CreateOrderDto) {
    // 1. Escribir el dato en la base de datos primero para obtener el ID y confirmar la persistencia.
    const newOrder = await this.prisma.order.create({
      data: createOrderDto,
    });

    console.log(`Orden ${newOrder.id} creada en la base de datos.`);

    // 2. Inmediatamente después, escribir el mismo dato en la caché.
    const cacheKey = `order_${newOrder.id}`;
    await this.cacheManager.set(cacheKey, newOrder, 300); // TTL de 300 segundos

    console.log(`Orden ${newOrder.id} escrita en la caché (Write-Through).`);

    // 3. La operación se completa y se devuelve el dato.
    return newOrder;
  }

  /**
   * Método de lectura para complementar la estrategia (usando patrón Cache-Aside).
   */
  async findOne(id: number) {
    const cacheKey = `order_${id}`;
    const cachedOrder = await this.cacheManager.get(cacheKey);

    if (cachedOrder) {
      console.log('Retornando orden desde la caché.');
      return cachedOrder;
    }

    console.log('Buscando orden en la base de datos.');
    const order = await this.prisma.order.findUnique({ where: { id } });

    // Opcional: Si por alguna razón la orden no está en caché (ej. expiró el TTL),
    // la volvemos a añadir al leerla de la BD.
    if (order) {
      await this.cacheManager.set(cacheKey, order, 300);
    }

    return order;
  }
}