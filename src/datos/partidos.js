import { supabase, unwrap } from "../lib/supabase";

// Crea un partido y devuelve la fila insertada (incluye el id generado)
export async function crearPartido(payload) {
  return unwrap(supabase.from("partido").insert(payload).select().single());
}

// Lee los partidos de un equipo, los más recientes primero.
export async function leerPartidos(idEquipo) {
  return unwrap(
    supabase
      .from("partido")
      .select("id, rival, campo, fecha, hora, id_equipo")
      .eq("id_equipo", idEquipo)
      .order("fecha", { ascending: false })
      .order("hora", { ascending: false })
  );
}

// Obtiene un partido por id (equipo, rival, campo, fecha, hora...)
export async function obtenerPartido(id) {
  return unwrap(supabase.from("partido").select("*").eq("id", id).single());
}
