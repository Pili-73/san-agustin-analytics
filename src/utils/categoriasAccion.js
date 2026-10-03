// Las categorías de acción que se listan en "todas las acciones", en el
// orden y agrupación fijados para las columnas de ataque y de defensa.
// Cada fila lleva clave (la clave del recuento en calcularEstadisticas),
// titulo (lo que se muestra) y fin (el código de accion.fin del que sale).
// Si una categoría solo tiene sentido en un contexto y comparte puesto con
// otra del contexto contrario (p.ej. "Pérdidas" en ataque / "Intercepciones"
// en defensa), esos tres campos son un objeto {ATQ, DEF} en vez de un valor
// único: así la fila sigue siendo una sola, en un único puesto del orden,
// sin depender de que dos filas filtradas por separado casualmente cuadren.
// anchoCompleto: la fila ocupa ella sola una línea entera en la rejilla de 2 columnas.
export const CATEGORIAS_ACCION = [
  { clave: "unoVsUno", titulo: "1 vs 1", fin: "1V1" },
  { clave: "dosVsDos", titulo: "2 vs 2", fin: "2V2" },
  { clave: "penaltis", titulo: "7 m", fin: "7M" },
  { clave: "exclusiones", titulo: "Exclusiones", fin: "2MIN" },
  { clave: "faltasRecibidas", titulo: "Faltas", fin: "FAL" },
  { clave: "bloqueos", titulo: "Bloqueos", fin: "BLQ" },
  {
    clave: { ATQ: "perdidas", DEF: "intercepciones" },
    titulo: { ATQ: "Pérdidas", DEF: "Intercepciones" },
    fin: { ATQ: "PER", DEF: "INT" },
  },
  { clave: "infracciones", titulo: "Infracciones", fin: "INF" },
  { clave: "faltasAtaque", titulo: "Faltas en ataque", fin: "FAT", anchoCompleto: true },
];

function porContexto(valor, contexto) {
  return typeof valor === "string" ? valor : valor[contexto];
}

// Las filas de CATEGORIAS_ACCION ya resueltas para un contexto concreto
// ("ATQ" | "DEF"): siempre las mismas 9, en el mismo orden, con
// clave/titulo/fin ya elegidos — así dos columnas de contextos distintos
// (Ataque y Defensa) nunca pueden desalinearse entre sí.
export function categoriasPorContexto(contexto) {
  return CATEGORIAS_ACCION.map((fila) => ({
    clave: porContexto(fila.clave, contexto),
    titulo: porContexto(fila.titulo, contexto),
    fin: porContexto(fila.fin, contexto),
    anchoCompleto: fila.anchoCompleto,
  }));
}

// clave -> código fin, aplanando la fila que varía por contexto en sus dos
// variantes. Única fuente de la correspondencia clave/fin: calcularEstadisticas
// la usa para no repetir los códigos fin por su cuenta.
export const FIN_POR_CLAVE = Object.fromEntries(
  CATEGORIAS_ACCION.flatMap((fila) =>
    typeof fila.fin === "string"
      ? [[fila.clave, fila.fin]]
      : Object.keys(fila.fin).map((contexto) => [fila.clave[contexto], fila.fin[contexto]])
  )
);

// Resultado de un lanzamiento (accion.gol_parada_fuera) y sanciones
// (accion.fin dentro de at_def_san "SAN"): códigos fijos, no configurables
// por equipo, así que no salen del catálogo como el resto de acciones.
const RESULTADO_LANZAMIENTO = {
  GOL: { titulo: "Gol", color: "verde" },
  PAR: { titulo: "Parada", color: "azul" },
  FUE: { titulo: "Fuera", color: "malo" },
};

const TITULO_SANCION = {
  "2MIN": "Exclusión",
  AMARILLA: "Tarjeta amarilla",
  ROJA: "Tarjeta roja",
  AZUL: "Tarjeta azul",
};

// Título y color para mostrar una acción individual (p.ej. en la línea del
// tiempo): un lanzamiento no tiene `fin` (lo describe gol_parada_fuera), una
// sanción usa sus propios códigos fijos, y el resto sale del catálogo de
// datos de ataque/defensa del equipo (catalogoPorContexto, de
// useOpcionesAccion) para respetar los títulos que el equipo haya puesto.
export function describirAccion(accion, catalogoPorContexto = {}) {
  if (accion.gol_parada_fuera) {
    const resultado = RESULTADO_LANZAMIENTO[accion.gol_parada_fuera] || {
      titulo: accion.gol_parada_fuera,
      color: "gris",
    };
    return { titulo: `Lanzamiento: ${resultado.titulo}`, color: resultado.color };
  }
  if (accion.at_def_san === "SAN") {
    return { titulo: TITULO_SANCION[accion.fin] || accion.fin, color: "gris" };
  }
  const catalogo = catalogoPorContexto[accion.at_def_san] || [];
  const opcion = catalogo.find((item) => item.fin === accion.fin);
  return opcion ? { titulo: opcion.titulo, color: opcion.color } : { titulo: accion.fin || "Acción", color: "gris" };
}

// "favor" | "contra": en qué columna va una acción en la línea del tiempo,
// para no tener que decirlo con texto. Un lanzamiento o cualquier otra
// acción de ataque/defensa ya lo dice at_def_san (igual que en Directo.jsx
// para el marcador: ATQ = nuestro, DEF = del rival). Una sanción no tiene
// ATQ/DEF propio: id_jugador es siempre de nuestro plantel (no se registra
// el del rival), así que null significa que la sanción es del rival -a
// favor nuestro- y con id_jugador es a uno de los nuestros -en contra-.
export function contextoAccion(accion) {
  if (accion.at_def_san === "SAN") return accion.id_jugador ? "contra" : "favor";
  return accion.at_def_san === "DEF" ? "contra" : "favor";
}
