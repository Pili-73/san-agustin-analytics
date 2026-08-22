import { useMemo } from "react";
import { useDatosTemporada } from "./useDatosTemporada";
import { calcularHojaCompleta, filtrarPorFecha } from "../utils/estadisticas";

// jugadorId: null para las estadísticas de todo el equipo, o un id para las
// de un jugador concreto — es la misma página y el mismo cálculo
// (calcularHojaCompleta), solo cambia sobre qué acciones se aplica.
// rango: [fechaInicioISO, fechaFinISO], o null para no filtrar por fecha.
export function useEstadisticasTemporada(idEquipo, jugadorId = null, rango = null) {
  const { cargando, error, partidos, acciones, partidoPorId, rangoFechas } = useDatosTemporada(idEquipo);

  const accionesBase = useMemo(
    () => (jugadorId ? acciones.filter((accion) => accion.id_jugador === jugadorId) : acciones),
    [acciones, jugadorId]
  );
  const accionesFiltradas = useMemo(
    () => filtrarPorFecha(accionesBase, partidoPorId, rango),
    [accionesBase, partidoPorId, rango]
  );
  const hoja = useMemo(() => calcularHojaCompleta(accionesFiltradas), [accionesFiltradas]);

  return { cargando, error, partidos, rangoFechas, ...hoja };
}
