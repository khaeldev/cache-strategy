import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class LogService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
  ) {}

  /**
   * Implementación de la escritura para Write-Around.
   * El log se escribe directamente en la BD, evitando la caché.
   */
  async create(createLogDto: CreateLogDto) {
    console.log('Escribiendo log directamente en la base de datos (Write-Around).');
    // 1. La escritura va directo a la fuente de persistencia.
    const newLog = await this.prisma.log.create({
      data: createLogDto,
    });
    // La caché no se toca en la operación de escritura.
    return newLog;
  }

  /**
   * Implementación de la lectura, que sigue el patrón Cache-Aside.
   */
  async findByLevel(level: string) {
    const cacheKey = `logs_level_${level}`;
    // 2a. Buscar primero en la caché.
    const cachedLogs = await this.cacheManager.get(cacheKey);

    if (cachedLogs) {
      console.log(`Retornando logs de nivel '${level}' desde la caché.`);
      return cachedLogs;
    }

    // 2c. Cache Miss: leer desde la base de datos.
    console.log(`Cache miss. Buscando logs de nivel '${level}' en la base de datos.`);
    const logs = await this.prisma.log.findMany({
      where: { level },
    });

    if (logs.length > 0) {
      // Poblar la caché para futuras lecturas.
      await this.cacheManager.set(cacheKey, logs, 600); // TTL de 600 segundos
    }

    return logs;
  }
}