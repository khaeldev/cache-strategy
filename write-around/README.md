# Estrategia de Caché: Write-Around

## ¿Cómo funciona?

La estrategia *Write-Around* es una optimización que combina una escritura directa a la base de datos con una lectura de tipo Cache-Aside. El objetivo principal es evitar que la caché se llene con datos que se escriben pero que no se leen con frecuencia.

El flujo es el siguiente:

1.  **Operación de Escritura:** La aplicación escribe el dato nuevo o actualizado *directamente en la base de datos*, ignorando por completo la caché. [1]
2.  **Operación de Lectura:** Cuando la aplicación necesita leer un dato, sigue el patrón Cache-Aside:
    a. Primero busca el dato en la caché.
    b. Si hay un **Cache Hit**, el dato se devuelve desde la caché.
    c. Si hay un **Cache Miss**, la aplicación lee el dato desde la base de datos y, a continuación, lo almacena en la caché para futuras lecturas.

De esta manera, solo los datos que son leídos activamente llegan a ocupar espacio en la caché.

## ¿Por qué usarla?

Para proteger la caché de la "contaminación". En muchas aplicaciones, se escriben grandes volúmenes de datos que raramente se vuelven a leer (o nunca). Si se usara una estrategia como Write-Through, la caché se llenaría rápidamente de estos datos "fríos", desplazando datos "calientes" que sí son accedidos con frecuencia y que se beneficiarían de estar en la caché.

## ¿Cuándo usarla?

*   En sistemas de registro (logging) o auditoría, donde se escriben eventos constantemente pero solo se consultan en caso de error o para análisis esporádicos.
*   En la ingesta de datos en tiempo real, como en sistemas de analíticas o chats, donde el flujo de escritura es masivo y los datos históricos no se consultan de inmediato.
*   Cuando la carga de trabajo de escritura y lectura está claramente separada, es decir, los datos que se escriben no son los mismos que se leen de forma inmediata y frecuente.

## Ventajas y Desventajas

### Ventajas

*   **Protección de la caché:** Evita que datos de un solo uso o de baja frecuencia de lectura ocupen espacio valioso en la caché.
*   **Rendimiento de lectura mejorado:** Al mantener solo los datos "calientes" en la caché, se aumenta la probabilidad de "cache hits" para los datos que realmente importan.
*   **Alta disponibilidad de la base de datos:** La escritura no depende de la caché, por lo que un fallo en la caché no interrumpe las operaciones de escritura.

### Desventajas

*   **Mayor latencia en la primera lectura:** Cualquier dato recién escrito que necesite ser leído inmediatamente después provocará un "cache miss" obligatorio, ya que la escritura lo omitió. Esto aumenta la latencia para esa primera lectura.
*   **Inconsistencia temporal:** Hay un período en el que un dato existe en la base de datos pero no en la caché. Si otra parte del sistema depende de la caché como fuente de verdad, podría operar con información desactualizada hasta que se produzca la primera lectura.

## Implementación en Nest.js

Para este ejemplo, implementaremos un servicio de logging simple. Los nuevos logs se escribirán directamente en la base de datos. Solo cuando se soliciten los logs de un nivel específico (por ejemplo, 'ERROR'), se cargarán en la caché.
