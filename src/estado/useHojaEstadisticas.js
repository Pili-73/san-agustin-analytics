import { useMemo, useState } from "react";
import { listarAccionesPartido } from "../datos/acciones";
import { useCargaAsync } from "./useCargaAsync";
import { calcularHojaCompleta, calcularMaxMinutos, filtrarPorTiempo } from "../utils/estadisticas";

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

  return { cargando, error, maxMinutos, ...hoja };
}
