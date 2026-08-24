import { useEffect, useMemo, useState } from "react";
import { listarAccionesPartido } from "../datos/acciones";
import { useCargaAsync } from "./useCargaAsync";
import { supabase } from "../lib/supabase";
import { calcularHojaCompleta, calcularMaxMinutos, calcularMinutosJugador, filtrarPorTiempo } from "../utils/estadisticas";

// jugadorId: null para las estadísticas de todo el equipo, o un id para las
// de un jugador concreto — es la misma página y el mismo cálculo
// (calcularHojaCompleta), solo cambia sobre qué acciones se aplica (igual
// que useEstadisticasTemporada).
// rango: [inicio, fin] en minutos de partido, o null para no filtrar por tiempo.
export function useHojaEstadisticas(partidoId, jugadorId = null, rango = null) {
  const [acciones, setAcciones] = useState([]);

  const { cargando, error } = useCargaAsync(
    () => (partidoId ? listarAccionesPartido(partidoId) : Promise.resolve([])),
    {
      deps: [partidoId],
      onExito: setAcciones,
      mensajeError: "No se pudieron cargar las estadísticas.",
    }
  );

  // Otro dispositivo puede seguir anotando el mismo partido mientras esta
  // pantalla está abierta. Nos suscribimos a los cambios de `accion` de este
  // partido y recargamos la lista al vuelo, sin depender de que se navegue
  // fuera y se vuelva a entrar para ver algo actualizado.
  useEffect(() => {
    if (!partidoId) return;

    const canal = supabase
      .channel(`accion-partido-${partidoId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "accion", filter: `id_partido=eq.${partidoId}` },
        () => {
          listarAccionesPartido(partidoId)
            .then(setAcciones)
            .catch((err) => console.error("No se pudo actualizar en directo", err));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [partidoId]);

  // maxMinutos se calcula sobre todas las acciones del partido (no las
  // filtradas por jugador ni por tiempo), para que la barra de intervalo no
  // cambie de escala al acotar el filtro o al cambiar de jugador.
  const maxMinutos = useMemo(() => calcularMaxMinutos(acciones), [acciones]);
  const accionesBase = useMemo(
    () => (jugadorId ? acciones.filter((accion) => accion.id_jugador === jugadorId) : acciones),
    [acciones, jugadorId]
  );
  const accionesFiltradas = useMemo(() => filtrarPorTiempo(accionesBase, rango), [accionesBase, rango]);
  const hoja = useMemo(() => calcularHojaCompleta(accionesFiltradas), [accionesFiltradas]);

  // Sobre `acciones` sin acotar por jugador: necesita ver también los
  // marcadores de fin de partido/1ª parte (sin id_jugador) de este partido.
  const minutosJugados = useMemo(
    () => (jugadorId ? calcularMinutosJugador(acciones, jugadorId) : null),
    [acciones, jugadorId]
  );

  return { cargando, error, maxMinutos, minutosJugados, ...hoja };
}
