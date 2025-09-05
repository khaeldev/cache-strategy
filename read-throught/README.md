# Estrategia de Caché: Read-Through

## ¿Cómo funciona?

La estrategia *Read-Through* se sitúa un paso más allá de Cache-Aside en términos de abstracción. En este patrón, la aplicación trata a la caché como si fuera la base de datos principal. La caché es la responsable de obtener los datos de la base de datos cuando estos no se encuentran en su almacén.

El flujo es el siguiente:

1.  La aplicación solicita un dato directamente a la caché.
2.  **Cache Hit:** Si el dato se encuentra en la caché, esta lo devuelve inmediatamente a la aplicación.
3.  **Cache Miss:** Si el dato no está en la caché, la propia caché (o el proveedor de datos que la gestiona) se encarga de:
    a. Consultar la base de datos para obtener el dato solicitado.
    b. Almacenar ese dato en su propio sistema para futuras peticiones.
    c. Devolver el dato a la aplicación.

La diferencia fundamental con Cache-Aside es que la aplicación no interactúa con la base de datos; esa responsabilidad se delega por completo a la capa de caché. [1, 14]

## ¿Por qué usarla?

Para simplificar el código de la aplicación. [13] Al abstraer la fuente de datos, la lógica de la aplicación se vuelve más limpia y se centra en su funcionalidad principal, sin tener que gestionar la sincronización entre la caché y la base de datos en las operaciones de lectura.

## ¿Cuándo usarla?

*   En arquitecturas donde se desea desacoplar fuertemente la aplicación de la base de datos.
*   Cuando se trabaja con modelos de datos que se leen con mucha frecuencia y es beneficioso tener una única fuente de verdad para las consultas (la caché).
*   Es ideal para aplicaciones nuevas, ya que se puede diseñar la capa de acceso a datos desde el principio con esta estrategia en mente.

## Ventajas y Desventajas

### Ventajas

*   **Código de aplicación más simple:** La aplicación no necesita implementar la lógica de "cache miss". Simplemente pide los datos a un servicio y este se los devuelve.
*   **Consistencia de datos en lectura:** Se consolida la lógica de acceso a datos en un solo lugar, lo que facilita el mantenimiento.

### Desventajas

*   **Mayor complejidad inicial:** Requiere una abstracción o un proveedor de caché que soporte esta funcionalidad. A nivel de aplicación, esto significa crear un servicio que encapsule esta lógica.
*   **Latencia en el primer acceso:** Al igual que en Cache-Aside, la primera solicitud de un dato siempre resultará en un "cache miss" y, por tanto, en una mayor latencia al tener que consultar la base de datos.

## Implementación en Nest.js

Para simular esta estrategia en Nest.js, creamos un servicio que actúa como la capa de caché. El controlador solo interactúa con este servicio, que a su vez contiene la lógica para consultar la base de datos en caso de un "cache miss".
