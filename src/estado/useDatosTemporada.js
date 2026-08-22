import { useMemo, useState } from "react";
import { leerPartidos } from "../datos/partidos";
import { listarAccionesPartidos } from "../datos/acciones";
import { useCargaAsync } from "./useCargaAsync";
import { calcularRangoFechas } from "../utils/estadisticas";

async function cargarDatosTemporada(idEquipo) {
  const partidos = await leerPartidos(idEquipo);
  const acciones = await listarAccionesPartidos(partidos.map((partido) => partido.id));
  return { partidos, acciones };
}

// Carga todos los partidos y acciones de un equipo (toda la temporada): base
// común de las estadísticas de temporada, tanto de equipo como por jugador.
export function useDatosTemporada(idEquipo) {
  const [datos, setDatos] = useState({ partidos: [], acciones: [] });

  const { cargando, error } = useCargaAsync(
    () => (idEquipo ? cargarDatosTemporada(idEquipo) : Promise.resolve({ partidos: [], acciones: [] })),
    {
      deps: [idEquipo],
      onExito: setDatos,
      mensajeError: "No se pudieron cargar los datos de la temporada.",
    }
  );

  const partidoPorId = useMemo(
    () => Object.fromEntries(datos.partidos.map((partido) => [partido.id, partido])),
    [datos.partidos]
  );
  const rangoFechas = useMemo(() => calcularRangoFechas(datos.partidos), [datos.partidos]);

  return { cargando, error, partidos: datos.partidos, acciones: datos.acciones, partidoPorId, rangoFechas };
}
