# Estructura inicial

Este proyecto separa las pantallas, las piezas visuales, el acceso a los datos y el estado temporal del partido.

`src/lib/supabase.js` se mantiene como punto único de conexión a Supabase. La base de datos y sus tablas actuales no se modifican en esta fase.

## Recorrido principal

`Inicio` → `Preparar` → `Directo` → `Estadisticas`

También se puede abrir un partido previo desde `PartidosGuardados` y consultar su informe.

## Carpetas

- `vistas`: pantallas completas de la aplicación.
- `piezas`: bloques reutilizables de interfaz, agrupados por función.
- `datos`: operaciones de lectura y escritura de partidos, acciones y equipos.
- `estado`: estado temporal del partido en curso y sincronización pendiente.
- `utilidades`: cálculos y catálogos reutilizables.
- `estilos`: estilos propios de cada zona de la aplicación.

Los ficheros creados son marcadores sin lógica para poder completar la migración paso a paso.
