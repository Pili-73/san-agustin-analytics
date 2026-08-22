import { useMemo, useState } from "react";
import { listarAccionesPartido } from "../datos/acciones";
import { useCargaAsync } from "./useCargaAsync";
import {
  FILTROS_DEFENSA,
  FILTROS_SITUACION,
  calcularDesglosePorCampo,
  calcularEficaciaPorZonas,
  calcularEstadisticas,
  calcularMaxMinutos,
  calcularSanciones,
  filtrarPorTiempo,
} from "../utils/estadisticas";

// rango: [inicio, fin] en minutos de partido, o null para no filtrar por tiempo.
export function useHojaEstadisticas(partidoId, rango = null) {
  const [acciones, setAcciones] = useState([]);

  const { cargando, error } = useCargaAsync(
    () => (partidoId ? listarAccionesPartido(partidoId) : Promise.resolve([])),
    {
      deps: [partidoId],
      onExito: setAcciones,
      mensajeError: "No se pudieron cargar las estadísticas.",
    }
  );

  // maxMinutos se calcula sobre todas las acciones (no las filtradas), para
  // que la barra de intervalo no se reduzca al acotar el filtro.
  const maxMinutos = useMemo(() => calcularMaxMinutos(acciones), [acciones]);
  const accionesFiltradas = useMemo(() => filtrarPorTiempo(acciones, rango), [acciones, rango]);

  const estadisticasAtaque = useMemo(() => calcularEstadisticas(accionesFiltradas, "ATQ", null), [accionesFiltradas]);
  const estadisticasDefensa = useMemo(() => calcularEstadisticas(accionesFiltradas, "DEF", null), [accionesFiltradas]);
  const sanciones = useMemo(() => calcularSanciones(accionesFiltradas), [accionesFiltradas]);

  const desgloseSituacionAtaque = useMemo(
    () => calcularDesglosePorCampo(accionesFiltradas, "ATQ", "sit_ofensiva", FILTROS_SITUACION),
    [accionesFiltradas]
  );
  const desgloseSituacionDefensa = useMemo(
    () => calcularDesglosePorCampo(accionesFiltradas, "DEF", "sit_ofensiva", FILTROS_SITUACION),
    [accionesFiltradas]
  );
  const desgloseFormacionAtaque = useMemo(
    () => calcularDesglosePorCampo(accionesFiltradas, "ATQ", "tipo_def", FILTROS_DEFENSA),
    [accionesFiltradas]
  );
  const desgloseFormacionDefensa = useMemo(
    () => calcularDesglosePorCampo(accionesFiltradas, "DEF", "tipo_def", FILTROS_DEFENSA),
    [accionesFiltradas]
  );

  const eficaciaZonasAtaque = useMemo(() => calcularEficaciaPorZonas(accionesFiltradas, "ATQ"), [accionesFiltradas]);
  const eficaciaZonasDefensa = useMemo(() => calcularEficaciaPorZonas(accionesFiltradas, "DEF"), [accionesFiltradas]);

  return {
    cargando,
    error,
    maxMinutos,
    estadisticasAtaque,
    estadisticasDefensa,
    sanciones,
    desgloseSituacionAtaque,
    desgloseSituacionDefensa,
    desgloseFormacionAtaque,
    desgloseFormacionDefensa,
    eficaciaZonasAtaque,
    eficaciaZonasDefensa,
  };
}
