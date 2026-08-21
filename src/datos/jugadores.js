import { supabase, unwrap } from "../lib/supabase";

const COLUMNAS = "id, nombre, apellido, dorsal, posicion, id_equipo, activo";

// Por defecto solo devuelve jugadores activos (para Directo y similares).
// La pantalla de gestión de plantilla pide incluirInactivos para ver también
// los dados de baja y poder reactivarlos.
export async function listarJugadoresEquipo(idEquipo, { incluirInactivos = false } = {}) {
  let query = supabase.from("jugador").select(COLUMNAS).eq("id_equipo", idEquipo).order("dorsal");
  if (!incluirInactivos) query = query.eq("activo", true);

  return unwrap(query);
}

export async function crearJugador({ nombre, apellido, dorsal, posicion, id_equipo }) {
  const nuevoJugador = {
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    dorsal: Number(dorsal),
    posicion,
    id_equipo: Number(id_equipo),
  };

  return unwrap(supabase.from("jugador").insert(nuevoJugador).select(COLUMNAS).single());
}

export async function actualizarJugador(id, { nombre, apellido, dorsal, posicion }) {
  return unwrap(
    supabase
      .from("jugador")
      .update({ nombre: nombre.trim(), apellido: apellido.trim(), dorsal: Number(dorsal), posicion })
      .eq("id", id)
      .select(COLUMNAS)
      .single()
  );
}

// Borrado definitivo: solo funciona si el jugador no tiene acciones
// registradas (restricción de la base de datos). Si las tiene, quien llama
// debe capturar el error (código 23503) y usar desactivarJugador en su lugar.
export async function eliminarJugador(id) {
  await unwrap(supabase.from("jugador").delete().eq("id", id));
}

// Baja lógica: oculta al jugador de Directo y de la plantilla activa sin
// perder su historial de acciones. Se usa cuando eliminarJugador falla por la
// restricción anterior.
export async function desactivarJugador(id) {
  return unwrap(supabase.from("jugador").update({ activo: false }).eq("id", id).select(COLUMNAS).single());
}

export async function activarJugador(id) {
  return unwrap(supabase.from("jugador").update({ activo: true }).eq("id", id).select(COLUMNAS).single());
}
