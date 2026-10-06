import { useMemo, useState } from "react";
import { listarCatalogo, listarSeleccionEquipo } from "../datos/opcionesAccion";
import { useCargaAsync } from "./useCargaAsync";
import { compararOpcionesPorColor } from "../utils/categoriasAccion";

// Catálogo completo de datos de ataque/defensa + selección activa de un
// equipo, ya separados por contexto y ordenados por color (verde, gris,
// rojo; ver compararOpcionesPorColor). idEquipo null (mientras se carga el
// equipo dueño) da listas vacías, igual que useDatosTemporada.
export function useOpcionesAccion(idEquipo) {
  const [catalogo, setCatalogo] = useState([]);
  const [seleccionIds, setSeleccionIds] = useState([]);

  const { cargando, error } = useCargaAsync(
    () => (idEquipo ? Promise.all([listarCatalogo(), listarSeleccionEquipo(idEquipo)]) : Promise.resolve([[], []])),
    {
      deps: [idEquipo],
      onExito: ([catalogoCargado, seleccionCargada]) => {
        setCatalogo(catalogoCargado);
        setSeleccionIds(seleccionCargada);
      },
      mensajeError: "No se pudieron cargar las opciones configuradas.",
    }
  );

  const opcionesPorContexto = useMemo(() => {
    const seleccion = new Set(seleccionIds);
    const activas = catalogo.filter((opcion) => seleccion.has(opcion.id));
    return {
      ATQ: activas.filter((opcion) => opcion.contexto === "ATQ").sort(compararOpcionesPorColor),
      DEF: activas.filter((opcion) => opcion.contexto === "DEF").sort(compararOpcionesPorColor),
    };
  }, [catalogo, seleccionIds]);

  // El catálogo completo por contexto (sin filtrar por la selección del
  // equipo): sirve para poder poner título y color a una acción registrada
  // con un dato que el equipo ya no tiene activo (o nunca lo tuvo), en vez
  // de descartarla del recuento de "todas las acciones".
  const catalogoPorContexto = useMemo(
    () => ({
      ATQ: catalogo.filter((opcion) => opcion.contexto === "ATQ").sort(compararOpcionesPorColor),
      DEF: catalogo.filter((opcion) => opcion.contexto === "DEF").sort(compararOpcionesPorColor),
    }),
    [catalogo]
  );

  return { cargando, error, catalogo, seleccionIds, opcionesPorContexto, catalogoPorContexto };
}
