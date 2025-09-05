# Estrategia de Caché: Cache-Aside (Carga Perezosa)

## ¿Cómo funciona?

En la estrategia *Cache-Aside* o *Lazy Loading*, la aplicación es la responsable de manejar la lógica de la caché. [1] El flujo es el siguiente:

1.  La aplicación busca un dato en la caché.
2.  **Cache Hit:** Si el dato se encuentra en la caché, se devuelve a la aplicación.
3.  **Cache Miss:** Si el dato no se encuentra en la caché, la aplicación lo busca en la base de datos.
4.  La aplicación almacena el dato obtenido de la base de datos en la caché para futuras solicitudes.
5.  Finalmente, el dato se devuelve a la aplicación.

## ¿Por qué usarla?

Esta es una de las estrategias de caché más comunes y de propósito general. [4] Es relativamente simple de implementar y es muy efectiva cuando los datos no cambian con frecuencia.

## ¿Cuándo usarla?

*   En aplicaciones con un alto volumen de lecturas y donde los mismos datos son solicitados repetidamente.
*   Cuando es aceptable tener datos ligeramente desactualizados por un corto período.
*   Para datos que no son críticos si se pierden en caso de una falla de la caché, ya que la fuente de verdad sigue siendo la base de datos.

## Ventajas y Desventajas

### Ventajas

*   **Resiliencia:** Si la caché falla, la aplicación puede seguir funcionando consultando directamente la base de datos.
*   **Consistencia eventual:** Los datos en la caché se actualizan solo cuando se solicitan, lo que puede ser suficiente para muchas aplicaciones.

### Desventajas

*   **Latencia en el primer acceso:** La primera vez que se solicita un dato, siempre habrá un "cache miss", lo que resulta en una mayor latencia.
*   **Código más complejo:** La lógica de la caché debe ser manejada explícitamente por la aplicación.
*   **Datos obsoletos:** Los datos en la caché pueden quedar desactualizados si se modifican en la base de datos y no se invalidan en la caché.
