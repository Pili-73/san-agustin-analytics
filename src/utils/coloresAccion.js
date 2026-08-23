// Color del indicador de cada acción, compartido por el registro en Directo y
// por los listados de acciones de Estadísticas.
// codigo: "ATQ" | "DEF" | "SAN". fin: código de `accion.fin`.
export function colorOpcion(codigo, fin) {
  if (codigo === "SAN") {
    return { "2MIN": "gris", AMARILLA: "amarillo", ROJA: "rojo", AZUL: "azul" }[fin];
  }
  if (codigo === "DEF") {
    if (["1V1", "2V2", "7M"].includes(fin)) return "rojo";
    if (["INF", "FAT", "INT"].includes(fin)) return "verde";
    if (["FAL", "BLQ"].includes(fin)) return "blanco";
    return "malo";
  }
  if (["FAL", "BLQ"].includes(fin)) return "blanco";
  if (["1V1", "2V2", "2MIN", "7M"].includes(fin)) return "verde";
  return "malo";
}
