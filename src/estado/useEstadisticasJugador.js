import { useMemo, useState } from "react";
import { listarAccionesPartido } from "../datos/acciones";
import { useCargaAsync } from "./useCargaAsync";
import {
  calcularEficaciaPorZonas,
  calcularEstadisticas,
  calcularMaxMinutos,
  calcularSanciones,
  combinarPorCategoria,
  filtrarPorTiempo,
} from "../utils/estadisticas";

// rango: [inicio, fin] en minutos de partido, o null para no filtrar por tiempo.
export function useEstadisticasJugador(partidoId, jugadorId, rango = null) {
  const [acciones, setAcciones] = useState([]);

  const { cargando, error } = useCargaAsync(
    () => (partidoId ? listarAccionesPartido(partidoId) : Promise.resolve([])),
    {
      deps: [partidoId],
      onExito: setAcciones,
      mensajeError: "No se pudieron cargar las estadísticas del jugador.",
    }
  );

  // maxMinutos se calcula sobre todo el partido (no solo este jugador), para
  // que la barra de intervalo no cambie de escala al cambiar de jugador.
  const maxMinutos = useMemo(() => calcularMaxMinutos(acciones), [acciones]);

  const accionesJugador = useMemo(
    () => filtrarPorTiempo(acciones.filter((accion) => accion.id_jugador === jugadorId), rango),
    [acciones, jugadorId, rango]
  );

  const estadisticasAtaque = useMemo(() => calcularEstadisticas(accionesJugador, "ATQ", null), [accionesJugador]);
  const estadisticasDefensa = useMemo(() => calcularEstadisticas(accionesJugador, "DEF", null), [accionesJugador]);
  const sanciones = useMemo(() => calcularSanciones(accionesJugador), [accionesJugador]);
  const todasLasAcciones = useMemo(
    () => combinarPorCategoria(estadisticasAtaque, estadisticasDefensa),
    [estadisticasAtaque, estadisticasDefensa]
  );

  // Ambos contextos se calculan siempre; quien llama elige cuál mostrar
  // según sea portero o jugador de campo (mismo criterio que estadisticasAtaque/Defensa).
  const eficaciaZonasAtaque = useMemo(() => calcularEficaciaPorZonas(accionesJugador, "ATQ"), [accionesJugador]);
  const eficaciaZonasDefensa = useMemo(() => calcularEficaciaPorZonas(accionesJugador, "DEF"), [accionesJugador]);

  return {
    cargando,
    error,
    maxMinutos,
    estadisticasAtaque,
    estadisticasDefensa,
    sanciones,
    todasLasAcciones,
    eficaciaZonasAtaque,
    eficaciaZonasDefensa,
  };
}
