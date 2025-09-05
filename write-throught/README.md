# Estrategia de Caché: Write-Through

## ¿Cómo funciona?

En la estrategia *Write-Through*, cada vez que la aplicación realiza una operación de escritura (crear o actualizar), los datos se escriben de forma síncrona tanto en la caché como en la base de datos subyacente. La operación no se considera completa hasta que ambos almacenes de datos confirman la escritura. [3]

El flujo es el siguiente:

1.  La aplicación envía una solicitud de escritura (por ejemplo, `create` o `update`) a la capa de caché.
2.  La capa de caché escribe inmediatamente el dato en su propio almacén (Redis).
3.  A continuación, la capa de caché escribe el mismo dato en la base de datos.
4.  Solo después de que ambas operaciones de escritura (en caché y en base de datos) se completen con éxito, la aplicación recibe una confirmación.

Esto garantiza que la caché y la base de datos estén siempre consistentes después de una operación de escritura.

## ¿Por qué usarla?

Para garantizar una alta consistencia de los datos. Con Write-Through, los datos leídos de la caché nunca estarán obsoletos, ya que cualquier modificación se refleja en ella instantáneamente. [8] Esto simplifica la lógica de la aplicación, ya que no tiene que preocuparse por la invalidación de la caché después de las escrituras.

## ¿Cuándo usarla?

*   En aplicaciones donde la consistencia de los datos es crítica.
*   Cuando los datos que se escriben se leen con mucha frecuencia casi de inmediato. Por ejemplo, actualizar el perfil de un usuario y que esos cambios se reflejen al instante en toda la aplicación.
*   En sistemas donde no se puede tolerar la pérdida de datos que podría ocurrir con otras estrategias como Write-Back.

## Ventajas y Desventajas

### Ventajas

*   **Alta consistencia de datos:** La caché y la base de datos están siempre sincronizadas. [3]
*   **Lecturas rápidas:** Las lecturas posteriores a una escritura siempre serán rápidas (cache hit), ya que el dato ya está en la caché.
*   **Fiabilidad:** La escritura en la base de datos es síncrona, por lo que se garantiza la persistencia de los datos.

### Desventajas

*   **Mayor latencia en la escritura:** La operación de escritura tiene que esperar a que se completen dos escrituras (en la caché y en la base de datos). Esto hace que el proceso sea más lento en comparación con estrategias que solo escriben en la base de datos. [4, 8]
*   **Posible llenado de la caché con datos poco utilizados:** Si se escriben datos que raramente se leen, se está ocupando espacio en la caché de forma innecesaria.

## Implementación en Nest.js

Para este ejemplo, implementaremos la creación de una orden. Cuando se crea una nueva orden, se guardará síncronamente en la base de datos y en la caché de Redis.
