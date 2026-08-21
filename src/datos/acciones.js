import { supabase, unwrap } from "../lib/supabase";

export async function crearAccion(payload) {
  return unwrap(supabase.from("accion").insert(payload).select().single());
}

// Para deshacer la última acción registrada.
export async function eliminarAccion(idAccion) {
  await unwrap(supabase.from("accion").delete().eq("id_accion", idAccion));
}

// Las estadísticas se calculan en cliente sobre todas las acciones del
// partido (ver utils/estadisticas.js), así que aquí no hace falta filtrar.
export async function listarAccionesPartido(partidoId) {
  return unwrap(supabase.from("accion").select("*").eq("id_partido", partidoId));
}
