// La temporada de balonmano va del 1 de agosto de un año al 31 de julio del
// año siguiente, y se etiqueta como "AAAA-AAAA" con el año completo (p.ej.
// de agosto de 2026 a julio de 2027 es "2026-2027") — mismo formato que se
// usa ya en el campo temporada de los equipos.
export function temporadaActual(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const inicio = fecha.getMonth() + 1 >= 8 ? anio : anio - 1;
  return `${inicio}-${inicio + 1}`;
}
