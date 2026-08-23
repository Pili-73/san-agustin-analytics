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
