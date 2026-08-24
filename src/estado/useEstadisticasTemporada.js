import { useMemo } from "react";
import { useDatosTemporada } from "./useDatosTemporada";
import { calcularHojaCompleta, calcularMinutosTemporada, filtrarPorFecha } from "../utils/estadisticas";

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

  // Partidos del equipo dentro del rango de fechas (jugara o no ese
  // jugador cada uno): denominador de "minutos jugados sobre 60 × partidos".
  const partidosEnRango = useMemo(
    () => (rango ? partidos.filter((partido) => partido.fecha >= rango[0] && partido.fecha <= rango[1]) : partidos),
    [partidos, rango]
  );
  // Sobre `acciones` sin acotar por jugador (para ver los marcadores de fin
  // de partido/1ª parte de cada partido), pero sí acotadas por fecha.
  const accionesTemporadaFiltradas = useMemo(
    () => filtrarPorFecha(acciones, partidoPorId, rango),
    [acciones, partidoPorId, rango]
  );
  const minutosJugados = useMemo(
    () =>
      jugadorId
        ? { totalMinutos: calcularMinutosTemporada(accionesTemporadaFiltradas, jugadorId), partidos: partidosEnRango.length }
        : null,
    [accionesTemporadaFiltradas, jugadorId, partidosEnRango]
  );

  return { cargando, error, partidos, rangoFechas, minutosJugados, ...hoja };
}
