import { supabase, unwrap } from "../lib/supabase";
import { conCache } from "../utils/cacheDatos";
import { listarPredeterminadas } from "./opcionesAccion";

const COLUMNAS = "id, nombre, temporada";

// Devuelve la lista de nombres de equipo, para el desplegable de Preparar
export async function listarEquipos() {
  return conCache("equipos", () => unwrap(supabase.from("equipo").select(COLUMNAS).order("nombre")));
}

export async function obtenerEquipo(id) {
  return conCache(`equipo:${id}`, () => unwrap(supabase.from("equipo").select(COLUMNAS).eq("id", id).single()));
}

// Al crear un equipo se siembra su selección de datos de ataque/defensa con
// las opciones predeterminadas del catálogo, para que arranque viendo lo
// mismo que ve cualquier equipo ya existente sin configuración manual.
export async function crearEquipo({ nombre, temporada }) {
  const nuevoEquipo = {
    nombre: nombre.trim(),
    ...(temporada.trim() ? { temporada: temporada.trim() } : {}),
  };

  const equipo = await unwrap(supabase.from("equipo").insert(nuevoEquipo).select(COLUMNAS).single());

  const predeterminadas = await listarPredeterminadas();
  if (predeterminadas.length > 0) {
    await unwrap(
      supabase
        .from("equipo_opcion")
        .insert(predeterminadas.map(({ id }) => ({ id_equipo: equipo.id, id_opcion: id })))
    );
  }

  return equipo;
}
