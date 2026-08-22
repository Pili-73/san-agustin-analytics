import { supabase, unwrap } from "../lib/supabase";
import { conCache } from "../utils/cacheDatos";
import { accionesPendientes, leerBorradosPendientes } from "../utils/colaSincronizacion";

export async function crearAccion(payload) {
  return unwrap(supabase.from("accion").insert(payload).select().single());
}

// Para deshacer la última acción registrada.
export async function eliminarAccion(idAccion) {
  await unwrap(supabase.from("accion").delete().eq("id_accion", idAccion));
}

// Las estadísticas se calculan en cliente sobre todas las acciones del
// partido (ver utils/estadisticas.js). Se combinan con las que sigan en la
// cola de sincronización (sin conexión) para que lo recién anotado aparezca
// ya en las cifras sin esperar a subir, y se excluyen las que estén
// pendientes de borrar (deshecho sin conexión, aún no confirmado).
export async function listarAccionesPartido(partidoId) {
  const acciones = await conCache(`acciones:partido:${partidoId}`, () =>
    unwrap(supabase.from("accion").select("*").eq("id_partido", partidoId))
  );
  const borrados = new Set(leerBorradosPendientes(partidoId));
  const vivas = acciones.filter((accion) => !borrados.has(accion.id_accion));
  return [...vivas, ...accionesPendientes(partidoId)];
}

// Todas las acciones de una lista de partidos (una temporada entera), para
// las estadísticas de equipo/jugador agregadas por fecha.
export async function listarAccionesPartidos(partidoIds) {
  if (partidoIds.length === 0) return [];
  const clave = `acciones:partidos:${partidoIds.slice().sort((a, b) => a - b).join(",")}`;
  const acciones = await conCache(clave, () =>
    unwrap(supabase.from("accion").select("*").in("id_partido", partidoIds))
  );
  const borradosPorPartido = new Map(partidoIds.map((id) => [id, new Set(leerBorradosPendientes(id))]));
  const vivas = acciones.filter((accion) => !borradosPorPartido.get(accion.id_partido)?.has(accion.id_accion));
  return [...vivas, ...partidoIds.flatMap((id) => accionesPendientes(id))];
}
