# Estrategia de Caché: Write-Back (Write-Behind)

## ¿Cómo funciona?

La estrategia *Write-Back*, también conocida como *Write-Behind*, optimiza drásticamente las operaciones de escritura. En este patrón, la aplicación escribe los datos únicamente en la caché, la cual confirma la operación de inmediato. La escritura a la base de datos se realiza de forma asíncrona en un momento posterior.

El flujo es el siguiente:

1.  La aplicación envía una solicitud de escritura a la capa de caché.
2.  La caché almacena el dato (marcado como "sucio" o pendiente de escritura) y confirma inmediatamente la operación a la aplicación.
3.  Después de un cierto tiempo, o cuando se acumula una cantidad determinada de datos, un proceso separado se encarga de tomar los datos "sucios" de la caché y escribirlos en la base de datos, a menudo en lotes.

Esto significa que la aplicación experimenta una latencia de escritura extremadamente baja, ya que no tiene que esperar a que se complete la escritura en la base de datos. [4]

## ¿Por qué usarla?

Para maximizar el rendimiento en aplicaciones con un volumen de escrituras muy alto. Al desacoplar la escritura de la base de datos, la aplicación puede manejar un flujo de solicitudes mucho mayor y responder a los usuarios de manera casi instantánea. Además, permite agrupar múltiples escrituras en una sola operación de base de datos, reduciendo significativamente la carga sobre esta.

## ¿Cuándo usarla?

*   En aplicaciones que necesitan registrar un gran volumen de datos rápidamente, como sistemas de análisis, telemetría de IoT, contadores de "me gusta" o visualizaciones en redes sociales.
*   Cuando una pequeña pérdida de datos en caso de fallo del sistema es tolerable. Si la caché se cae antes de que los datos se escriban en la base de datos, esos datos se perderán.
*   Para actualizar datos que no son críticos o que pueden reconstruirse, como cachés de sesión o datos de actividad del usuario.

## Ventajas y Desventajas

### Ventajas

*   **Latencia de escritura extremadamente baja:** Las operaciones son tan rápidas como una escritura en memoria.
*   **Reducción de la carga de la base de datos:** Las escrituras se pueden agrupar (batching), lo que resulta en menos transacciones y un uso más eficiente de los recursos de la base de datos.
*   **Mejora del rendimiento de la aplicación:** Ideal para cargas de trabajo pesadas en escritura.

### Desventajas

*   **Riesgo de pérdida de datos:** Este es el principal inconveniente. Si el servidor de caché falla antes de que los datos se persistan en la base de datos, los datos "sucios" se perderán para siempre.
*   **Mayor complejidad de implementación:** Requiere un mecanismo robusto para gestionar la cola de escritura, manejar reintentos y posibles fallos en el proceso de escritura asíncrona.
*   **Inconsistencia temporal:** Existe una ventana de tiempo en la que los datos en la caché son más recientes que los de la base de datos. Las lecturas directas a la base de datos podrían devolver datos obsoletos.

## Implementación en Nest.js

Simular esta estrategia requiere un componente asíncrono. En una aplicación real, se usaría un sistema de colas de trabajos como BullMQ o un planificador de tareas (cron job). Para este ejemplo, usaremos un `setTimeout` para simular el retraso en la escritura, y una lista de Redis para actuar como una cola simple de "datos sucios".
