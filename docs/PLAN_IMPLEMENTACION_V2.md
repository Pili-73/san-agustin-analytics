# Plan de implementación v2

Fecha de revisión: 20 de agosto de 2026.

Este plan adapta la aplicación React al esquema de datos comunicado para
`equipo`, `jugador`, `partido` y `accion`. La prioridad de diseño es tablet en
horizontal, manteniendo una disposición utilizable en móvil y escritorio.

## Seguimiento

- Completado: base de equipos/partidos, Inicio por tarjetas, creación de equipo,
  rutas con `id_equipo`, Preparar con campo opcional, PartidosGuardados filtrado
  y consulta de plantilla para pruebas.
- Completado: interfaz y registro de Directo con plantilla, zonas, marcador,
  cronómetro, tipos defensivos y acciones codificadas.
- Siguiente: recibir los cambios previstos para Estadísticas y sustituir sus
  consultas heredadas por cálculos compatibles con `accion`.

## Diagnóstico de partida

La aplicación existente es una migración de la versión Android y mantiene el
contrato de una base de datos anterior. Por ejemplo, consulta `Equipo`,
`Partido` y `Accion` con mayúsculas y usa campos como `equipo`, `idPartido`,
`ataqueDefensa` y `golParadaFuera`. El nuevo diagrama define tablas y campos
relacionales distintos: `equipo.id`, `partido.id_equipo`, `jugador.id_equipo`,
`accion.id_partido`, `accion.id_jugador`, `accion.at_def_san` y
`accion.golParadaFuera`.

Por tanto, antes de rediseñar las pantallas hay que sustituir la capa de datos
y retirar los catálogos/estadísticas basados en las columnas anteriores. No se
deben mezclar ambos contratos durante la implementación.

## Contrato de datos objetivo

| Entidad | Uso en la aplicación |
| --- | --- |
| `equipo` | `id`, `nombre`, `temporada`: tarjetas de Inicio y selección del equipo local. |
| `jugador` | `id`, `nombre`, `apellido`, `dorsal`, `posicion`, `id_equipo`: plantilla de cada equipo. |
| `partido` | `id`, `rival`, `campo` (opcional), `fecha`, `hora`, `id_equipo`: preparación y listado filtrado. |
| `accion` | `id_accion` automático, `id_partido`, `id_jugador`, `at_def_san`, `sit_ofensiva`, `tipo_def`, `fin`, `zona_lanz`, `zona_porteria`, `golParadaFuera`, `tiempo`: registro de Directo. |

Se centralizarán las consultas en repositorios de `src/datos/` y se usará un
modelo de interfaz normalizado (por ejemplo, `nombreCompleto` y
`nombreEquipo`) para que las vistas no dependan de mayúsculas o joins de
Supabase. Se confirmarán los nombres exactos que exponga Supabase, incluidos
los identificadores con mayúsculas y las políticas RLS, antes de activar las
escrituras.

## Navegación propuesta

```
Inicio
  /equipos/:equipoId/jugadores        (gestión de jugadores; pendiente de alcance)
  /equipos/:equipoId/partido/nuevo    (Preparar)
  /equipos/:equipoId/partidos         (PartidosGuardados filtrado)
      /partidos/:partidoId/estadisticas
  /partidos/:partidoId/directo
```

El identificador de equipo viaja en la URL, no únicamente en `location.state`,
para que una recarga o un enlace directo conserve el contexto.

## Fases de trabajo

### 1. Base técnica y datos

1. Crear los repositorios `equipos`, `jugadores`, `partidos` y `acciones` con
   lecturas e inserciones ajustadas al contrato objetivo.
2. Incorporar consultas de partido con el equipo relacionado para mostrar su
   nombre sin duplicarlo en `partido`.
3. Validar contra Supabase los nombres, relaciones y permisos de lectura /
   inserción; manejar estados de carga, vacío y error en cada pantalla.
4. Retirar el estado, filtros y estadísticas que dependen de las columnas del
   esquema antiguo. Mantener Estadísticas como pantalla estable hasta recibir
   sus nuevos requisitos.

### 2. Diseño adaptable común

1. Definir tokens de color: rojo claro para cards y ataque, rojo para acciones
   de campo, amarillo para porteros, blanco para elementos neutros y verde para
   defensa según la especificación.
2. Añadir un contenedor tablet-first (dos columnas en Directo, tarjetas
   desplazables en Inicio) y puntos de corte para apilar el contenido en móvil.
3. Revisar tamaños táctiles, contraste, foco de teclado y mensajes accesibles.

### 3. Inicio y equipos

1. Sustituir el menú fijo por una fila/carrusel desplazable de tarjetas rojas
   claras, una por cada equipo más una tarjeta de alta.
2. En cada tarjeta de equipo: título, `Jugadores`, `Iniciar partido` y `Ver
   partidos`, pasando siempre `equipoId`.
3. Implementar el formulario/modal de alta de equipo (`Nombre`, `temporada`)
   con actualización de la lista. La gestión de jugadores se dejará en ruta y
   pantalla placeholder hasta que se especifique su diseño y operaciones.

### 4. Preparar y PartidosGuardados

1. Preparar recibe el equipo por URL y muestra su nombre como contexto no
   editable; inserta `id_equipo`, rival, fecha y hora. `campo` no bloquea el
   envío y se guarda como `null` o cadena vacía según el contrato validado.
2. Encerrar el formulario en una card roja clara, conservar volver y adaptar el
   ancho a tablet/móvil.
3. PartidosGuardados recibe `equipoId`, consulta únicamente sus partidos y
   muestra nombre del equipo relacionado, rival, campo si existe, fecha y hora.
   Se elimina el filtro global por equipo de esta pantalla.

### 5. Directo: estructura y controles de partido

1. Cargar partido y plantilla mediante sus IDs; recuperar el nombre del equipo
   incluso tras una recarga.
2. Implementar el lateral izquierdo como plantilla ordenable, separada en
   `campo` y `banquillo` con separador visible. Incluir controles táctiles de
   subir/bajar o drag-and-drop accesible; porteros amarillos y resto rojos.
3. Mantener estado local de jugador seleccionado, situación ofensiva, tipo de
   defensa de cada equipo, cuadrante de lanzamiento, cuadrante de portería,
   marcador y cronómetro. El tiempo almacenado será una representación única
   acordada (por defecto `mm:ss`).
4. Usar la imagen existente como base y superponer las areas pulsables de sus
   dos rejillas 3x3: una para `zona_porteria` y otra para `zona_lanz`. Ambas
   se guardaran con el cuadrante correspondiente del 1 al 9, verificando la
   numeracion de la propia imagen.
5. Habilitar `Gol`, `Parada` y `Fuera` solo con jugador, `zona_lanz` y
   `zona_porteria` seleccionados. Cada pulsación inserta inmediatamente una
   acción con `fin` de lanzamiento, resultado, IDs y tiempo actual; solo se
   actualiza el marcador cuando la escritura se confirma.
6. Bajo el jugador seleccionado, presentar los grupos Ataque, Defensa y
   Sanciones. Cada opcion crea una accion inmediata con `id_jugador`,
   `at_def_san`, `fin`, `sit_ofensiva`, `tipo_def` y tiempo. Todas las
   acciones se relacionan solo con jugadores del equipo seleccionado. Los
   grupos se colorean rojo, blanco y verde respectivamente.
7. Añadir en el pie los cinco iconos de situación ofensiva: contragol, 1ª
   oleada, 2ª oleada, posicional y 7 m. La selección queda resaltada y se
   incluye en la siguiente acción.
8. Añadir un selector de `tipo_def` para cada equipo, modificable en cualquier
   momento. Una accion de defensa guarda el tipo del equipo propio; una de
   ataque, el elegido para el rival. El marcador abrira un menu con tiempo
   muerto, edicion de tiempo y acceso a estadisticas en directo. La
   finalizacion de partido detendra el reloj y volvera de forma confirmada.

### 6. Estadísticas y calidad

1. Conservar la ruta de Estadísticas, pero no trasladar los cálculos antiguos
   al esquema nuevo hasta recibir los cambios de esta pantalla.
2. Redefinir consultas y cálculos a partir de `accion` cuando se concrete el
   informe requerido.
3. Verificar navegación, recargas, inserción de cada tipo de acción, errores
   de red, interacción táctil en tablet y layouts móvil/tablet/escritorio.
4. Ejecutar `npm run lint` y `npm run build` como comprobación final de cada
   bloque implementado.

## Decisiones confirmadas y pendiente previo a Directo

Confirmado:

- La imagen disponible contiene ambas zonas: los nueve cuadrantes de
  `zona_porteria` y los nueve de `zona_lanz`.
- Todas las acciones se atribuyen solo a jugadores del equipo seleccionado. Los
  jugadores existentes en la base permiten probar Directo aunque aun no exista
  una pantalla de gestion.
- `tipo_def` guarda el tipo del equipo propio cuando `at_def_san` es defensa y
  el tipo del rival cuando es ataque.

Pendiente obligatorio antes de implementar las inserciones:

- La gestion completa de jugadores sigue pendiente de una especificacion para
  altas, edicion, bajas y orden inicial de la plantilla.

## Valores persistidos acordados

| Campo | Valores |
| --- | --- |
| `at_def_san` | `ATQ`, `DEF`, `SAN` |
| `fin` | `INF`, `FAT`, `PER`, `FAL`, `BLQ`, `1V1`, `2V2`, `2MIN`, `7M`, `INT`, `AMARILLA`, `ROJA`, `AZUL` |
| `sit_ofensiva` | `1OL`, `2OL`, `CGOL`, `POS`, `7M` |
| `tipo_def` | `6:0`, `5:1`, `3:3`, `3:2:1` |
| `gol_parada_fuera` | `GOL`, `PAR`, `FUE` |
| `tiempo` | `mm:ss` |

Los lanzamientos de jugadores de campo se registran como `ATQ` y guardan el
tipo defensivo vigente del rival. Si el jugador seleccionado es portero, se
registran como `DEF` y guardan la defensa propia; así se pueden anotar todos
los lanzamientos recibidos. Las sanciones no llevan `tipo_def` porque el
criterio de equipo especificado solo aplica a ataque y defensa.

Las zonas de lanzamiento se numeran así: 1–5 entre la línea continua y la
discontinua, de izquierda a derecha; 6–8 fuera de la discontinua (izquierda,
centro y derecha); y 9 para un lanzamiento lejano.

## Criterios de aceptación iniciales

- Inicio muestra exclusivamente los equipos reales de la base de datos y una
  tarjeta para crear otro.
- Crear un partido lo vincula al equipo desde el que se inició; el campo es
  opcional.
- El listado de partidos no puede mostrar partidos de otro equipo.
- Directo no permite guardar un lanzamiento sin las tres selecciones
  obligatorias y registra los IDs/zonas/tiempo correctos.
- Todas las rutas principales siguen funcionando tras recargar la página y son
  cómodas en una tablet horizontal.
