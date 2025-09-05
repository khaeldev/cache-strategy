import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

const DIRTY_EVENTS_QUEUE = 'dirty_events_queue';
const WRITE_DELAY_MS = 5000; // Escribir a la BD cada 5 segundos

@Injectable()
export class AnalyticsService implements OnModuleInit {
  private isWriting = false;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
  ) {}

  /**
   * Se ejecuta cuando el módulo se inicializa.
   * Inicia el "worker" que procesará la cola de escritura.
   */
  onModuleInit() {
    this.scheduleDbWrite();
  }

  /**
   * El método principal de la estrategia Write-Back.
   * Escribe el evento en la cola de Redis y responde inmediatamente.
   */
  async trackEvent(createEventDto: CreateEventDto) {
    const redisClient = this.cacheManager.store.getClient();
    // 1. Escribir el evento en la cola de Redis (la "caché").
    await redisClient.lpush(DIRTY_EVENTS_QUEUE, JSON.stringify(createEventDto));

    console.log(`Evento '${createEventDto.eventName}' encolado para escritura posterior.`);

    // 2. La operación se considera completa para el cliente.
    return { status: 'ok', message: 'Event tracked successfully' };
  }

  /**
   * Simula un worker que se ejecuta periódicamente para escribir
   * los datos de la cola de Redis en la base de datos.
   */
  private scheduleDbWrite() {
    setInterval(async () => {
      if (this.isWriting) {
        return; // Evitar ejecuciones concurrentes si la escritura anterior aún no ha terminado.
      }

      const redisClient = this.cacheManager.store.getClient();
      const eventCount = await redisClient.llen(DIRTY_EVENTS_QUEUE);

      if (eventCount === 0) {
        return; // No hay nada que escribir.
      }

      this.isWriting = true;
      console.log(`Procesando lote de ${eventCount} eventos para escribir en la BD...`);

      // Obtener todos los eventos de la cola en una operación atómica
      const eventsJson = await redisClient.lrange(DIRTY_EVENTS_QUEUE, 0, -1);
      await redisClient.ltrim(DIRTY_EVENTS_QUEUE, 1, 0); // Vaciar la lista

      const eventsToCreate = eventsJson.map((event) => JSON.parse(event));

      try {
        // 3. Escribir los datos "sucios" en la base de datos en un lote.
        await this.prisma.analyticsEvent.createMany({
          data: eventsToCreate,
        });
        console.log(`${eventsToCreate.length} eventos escritos exitosamente en la base de datos.`);
      } catch (error) {
        console.error('Error escribiendo eventos en la base de datos:', error);
        // En un sistema real, aquí iría la lógica de reintentos o manejo de colas de "letras muertas".
      } finally {
        this.isWriting = false;
      }
    }, WRITE_DELAY_MS);
  }
}