import { supabase, unwrap } from "../lib/supabase";
import { conCache } from "../utils/cacheDatos";

const COLUMNAS_CATALOGO = "id, contexto, fin, titulo, color, orden, predeterminada";

// Catálogo completo de datos posibles (ataque/defensa), compartido por todos
// los equipos. Se amplía a mano por SQL, no desde la app.
export async function listarCatalogo() {
  return conCache("catalogo-opciones", () =>
    unwrap(supabase.from("opcion_accion").select(COLUMNAS_CATALOGO).order("contexto").order("orden"))
  );
}

// Ids de las opciones del catálogo activas para un equipo.
export async function listarSeleccionEquipo(idEquipo) {
  const filas = await conCache(`seleccion-opciones:${idEquipo}`, () =>
    unwrap(supabase.from("equipo_opcion").select("id_opcion").eq("id_equipo", idEquipo))
  );
  return filas.map((fila) => fila.id_opcion);
}

// Todas las opciones marcadas como predeterminadas, para sembrar la
// selección de un equipo recién creado.
export async function listarPredeterminadas() {
  return unwrap(supabase.from("opcion_accion").select("id").eq("predeterminada", true));
}

// Sustituye la selección de un equipo por `idsSeleccionados`: relee el estado
// actual en la base de datos (no se fía de lo que haya en caché en el
// cliente) y aplica solo el borrado/alta necesarios.
export async function guardarSeleccionEquipo(idEquipo, idsSeleccionados) {
  const filasActuales = await unwrap(supabase.from("equipo_opcion").select("id_opcion").eq("id_equipo", idEquipo));
  const actuales = new Set(filasActuales.map((fila) => fila.id_opcion));
  const nuevos = new Set(idsSeleccionados);

  const aBorrar = [...actuales].filter((id) => !nuevos.has(id));
  const aInsertar = [...nuevos].filter((id) => !actuales.has(id));

  if (aBorrar.length > 0) {
    await unwrap(supabase.from("equipo_opcion").delete().eq("id_equipo", idEquipo).in("id_opcion", aBorrar));
  }
  if (aInsertar.length > 0) {
    await unwrap(
      supabase.from("equipo_opcion").insert(aInsertar.map((id_opcion) => ({ id_equipo: idEquipo, id_opcion })))
    );
  }
}
