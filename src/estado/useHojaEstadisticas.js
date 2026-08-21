import { useMemo, useState } from "react";
import { listarAccionesPartido } from "../datos/acciones";
import { useCargaAsync } from "./useCargaAsync";
import {
  FILTROS_DEFENSA,
  FILTROS_SITUACION,
  calcularDesglosePorCampo,
  calcularEstadisticas,
  calcularSanciones,
} from "../utils/estadisticas";

export function useHojaEstadisticas(partidoId) {
  const [acciones, setAcciones] = useState([]);

  const { cargando, error } = useCargaAsync(
    () => (partidoId ? listarAccionesPartido(partidoId) : Promise.resolve([])),
    {
      deps: [partidoId],
      onExito: setAcciones,
      mensajeError: "No se pudieron cargar las estadísticas.",
    }
  );

  const estadisticasAtaque = useMemo(() => calcularEstadisticas(acciones, "ATQ", null), [acciones]);
  const estadisticasDefensa = useMemo(() => calcularEstadisticas(acciones, "DEF", null), [acciones]);
  const sanciones = useMemo(() => calcularSanciones(acciones), [acciones]);

  const desgloseSituacionAtaque = useMemo(
    () => calcularDesglosePorCampo(acciones, "ATQ", "sit_ofensiva", FILTROS_SITUACION),
    [acciones]
  );
  const desgloseSituacionDefensa = useMemo(
    () => calcularDesglosePorCampo(acciones, "DEF", "sit_ofensiva", FILTROS_SITUACION),
    [acciones]
  );
  const desgloseFormacionAtaque = useMemo(
    () => calcularDesglosePorCampo(acciones, "ATQ", "tipo_def", FILTROS_DEFENSA),
    [acciones]
  );
  const desgloseFormacionDefensa = useMemo(
    () => calcularDesglosePorCampo(acciones, "DEF", "tipo_def", FILTROS_DEFENSA),
    [acciones]
  );

  return {
    cargando,
    error,
    estadisticasAtaque,
    estadisticasDefensa,
    sanciones,
    desgloseSituacionAtaque,
    desgloseSituacionDefensa,
    desgloseFormacionAtaque,
    desgloseFormacionDefensa,
  };
}
