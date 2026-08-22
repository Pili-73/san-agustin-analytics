// Geometría compartida de las 9 zonas de lanzamiento (el mismo polígono que
// dibuja SelectorZonasLanz en Directo, sobre /porteria_estadisticas.jpg), para
// que el selector de Directo y el mapa de eficacia de Estadísticas usen
// siempre las mismas zonas.
export const ZONAS_LANZAMIENTO = [
  // Zonas 1–5: entre las líneas continua (área) y discontinua, de izquierda a derecha.
  "0,54 12,54 22,61 0,76", "22,61 38,66 31,79 9,70",
  "38,66 61,66 68,79 31,79", "62,66 79,61 92,71 69,79",
  "78,61 88,54 100,54 100,76",
  // Zonas 6–8: exterior de la discontinua, izquierda, centro y derecha.
  "0,76 9,70 31,79 23,94 0,97", "31,79 68,79 77,94 23,94", "69,79 92,71 100,76 100,96 77,94",
  // Zona 9: lanzamiento lejano, por detrás de las ocho zonas anteriores.
  "0,97 31,93 70,93 100,96 100,100 0,100",
];

// Centro aproximado de un polígono (media de sus vértices), para colocar la
// etiqueta de eficacia dentro de cada zona en el mapa de estadísticas.
export function centroideZona(puntos) {
  const vertices = puntos.split(" ").map((par) => par.split(",").map(Number));
  const x = vertices.reduce((suma, [vx]) => suma + vx, 0) / vertices.length;
  const y = vertices.reduce((suma, [, vy]) => suma + vy, 0) / vertices.length;
  return { x, y };
}
