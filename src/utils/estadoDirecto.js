// Guarda un "snapshot" resumible del partido en directo (tiempo, marcador,
// tipos de defensa y plantilla ordenada) mientras se consulta Estadísticas,
// para poder reanudar el partido tal como estaba al volver.
const PREFIJO = "directo-partido:";

export function guardarEstadoDirecto(partidoId, estado) {
  try {
    sessionStorage.setItem(`${PREFIJO}${partidoId}`, JSON.stringify(estado));
  } catch (err) {
    console.error("No se pudo guardar el estado del partido", err);
  }
}

export function leerEstadoDirecto(partidoId) {
  try {
    const guardado = sessionStorage.getItem(`${PREFIJO}${partidoId}`);
    return guardado ? JSON.parse(guardado) : null;
  } catch (err) {
    console.error("No se pudo leer el estado del partido", err);
    return null;
  }
}

export function borrarEstadoDirecto(partidoId) {
  sessionStorage.removeItem(`${PREFIJO}${partidoId}`);
}
