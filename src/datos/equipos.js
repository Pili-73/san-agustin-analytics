import { supabase, unwrap } from "../lib/supabase";
import { conCache } from "../utils/cacheDatos";

const COLUMNAS = "id, nombre, temporada";

// Devuelve la lista de nombres de equipo, para el desplegable de Preparar
export async function listarEquipos() {
  return conCache("equipos", () => unwrap(supabase.from("equipo").select(COLUMNAS).order("nombre")));
}

export async function obtenerEquipo(id) {
  return conCache(`equipo:${id}`, () => unwrap(supabase.from("equipo").select(COLUMNAS).eq("id", id).single()));
}

export async function crearEquipo({ nombre, temporada }) {
  const nuevoEquipo = {
    nombre: nombre.trim(),
    ...(temporada.trim() ? { temporada: temporada.trim() } : {}),
  };

  return unwrap(supabase.from("equipo").insert(nuevoEquipo).select(COLUMNAS).single());
}
