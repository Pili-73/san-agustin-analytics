import { useMemo, useState } from "react";
import { listarAccionesPartido } from "../datos/acciones";
import { useCargaAsync } from "./useCargaAsync";
import { calcularHojaCompleta, calcularMaxMinutos, filtrarPorTiempo } from "../utils/estadisticas";

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
  const hoja = useMemo(() => calcularHojaCompleta(accionesFiltradas), [accionesFiltradas]);

  return { cargando, error, maxMinutos, ...hoja };
}
