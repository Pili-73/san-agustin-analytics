import { msDeTiempo } from "./tiempo";

// Superioridad / inferioridad numérica a partir de las exclusiones de 2 min
// anotadas. Es la única regla, compartida por Directo (lo que se ve en
// directo) y por Estadísticas (cómo se clasifica cada acción):
// - Exclusión de Agustinos: 2 min en Sanciones, con o sin jugador.
// - Exclusión del rival: 2 min en el desplegable de ataque (uno por cada
//   jugador suyo excluido). Del rival no se anota nada más.
// - Cada exclusión dura 2 min de reloj de juego y se suman entre sí. Un
//   4 min se anota como dos 2 min seguidos (el segundo al acabar el primero).
// - Las tarjetas (amarilla/roja/azul) no cambian el número de jugadores.
export const DURACION_EXCLUSION_MS = 2 * 60 * 1000;

export function esExclusionAgustinos(accion) {
  return accion.at_def_san === "SAN" && accion.fin === "2MIN";
}

export function esExclusionRival(accion) {
  return accion.at_def_san === "ATQ" && accion.fin === "2MIN";
}

// Exclusiones que siguen en curso en el instante `ms` del reloj de juego,
// con lo que les queda, separadas por equipo. Para el contador de Directo.
export function exclusionesActivas(acciones, ms) {
  const activas = { agustinos: [], rival: [] };
  for (const accion of acciones) {
    const lado = esExclusionAgustinos(accion) ? "agustinos" : esExclusionRival(accion) ? "rival" : null;
    const inicio = lado && msDeTiempo(accion.tiempo);
    if (inicio == null) continue;
    const restanteMs = inicio + DURACION_EXCLUSION_MS - ms;
    if (ms >= inicio && restanteMs > 0) activas[lado].push({ accion, restanteMs });
  }
  return activas;
}

// "SUP" | "INF" | null (igualdad), desde el punto de vista de Agustinos.
export function estadoNumerico(excluidosAgustinos, excluidosRival) {
  if (excluidosRival > excluidosAgustinos) return "SUP";
  if (excluidosAgustinos > excluidosRival) return "INF";
  return null;
}

// Devuelve las mismas acciones con `igualdad` ("IGU" | "SUP" | "INF") y el
// número de excluidos de cada lado en ese momento. Una exclusión cuenta
// desde la acción siguiente a ella (la propia acción en la que se produce
// sigue en igualdad) y durante 2 min de reloj de juego. Se calcula partido
// a partido, cada uno con su reloj, y siempre sobre todas las acciones del
// partido: hay que hacerlo antes de filtrar por jugador o por tiempo, o se
// perderían las exclusiones que no sean de ese jugador o de ese tramo.
export function anotarIgualdad(acciones) {
  const porPartido = new Map();
  acciones.forEach((accion, indice) => {
    if (!porPartido.has(accion.id_partido)) porPartido.set(accion.id_partido, []);
    porPartido.get(accion.id_partido).push({ accion, indice, ms: msDeTiempo(accion.tiempo) });
  });

  const resultado = new Array(acciones.length);
  for (const filas of porPartido.values()) {
    // Orden de anotación: por tiempo y, en el mismo segundo, por id (las que
    // siguen en la cola sin conexión aún no tienen id: van las últimas).
    filas.sort((a, b) => (a.ms ?? Infinity) - (b.ms ?? Infinity) || (a.accion.id_accion ?? Infinity) - (b.accion.id_accion ?? Infinity));
    const exclusiones = [];
    for (const fila of filas) {
      let excluidosAgustinos = 0;
      let excluidosRival = 0;
      if (fila.ms != null) {
        for (const exclusion of exclusiones) {
          if (fila.ms < exclusion.ms + DURACION_EXCLUSION_MS) {
            if (exclusion.lado === "agustinos") excluidosAgustinos += 1;
            else excluidosRival += 1;
          }
        }
      }
      const estado = estadoNumerico(excluidosAgustinos, excluidosRival);
      resultado[fila.indice] = { ...fila.accion, igualdad: estado || "IGU", excluidosAgustinos, excluidosRival };

      const lado = esExclusionAgustinos(fila.accion) ? "agustinos" : esExclusionRival(fila.accion) ? "rival" : null;
      if (lado && fila.ms != null) exclusiones.push({ lado, ms: fila.ms });
    }
  }
  return resultado;
}
