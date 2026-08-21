// Cálculo de estadísticas a partir de la tabla `accion` (esquema nuevo).
// Cada fila de `accion` es o bien un lanzamiento (tiene `gol_parada_fuera`,
// `zona_lanz`, `zona_porteria`) o bien un evento de ataque/defensa/sanción
// (tiene `fin`). Ambos comparten `at_def_san`, `sit_ofensiva` y `tipo_def`.

export const FILTROS_SITUACION = [
  { value: "POS", label: "Posicional" },
  { value: "CGOL", label: "Contragol" },
  { value: "1OL", label: "1ª oleada" },
  { value: "2OL", label: "2ª oleada" },
  { value: "7M", label: "7 m" },
];

export const FILTROS_DEFENSA = [
  { value: "6:0", label: "6:0" },
  { value: "5:1", label: "5:1" },
  { value: "3:3", label: "3:3" },
  { value: "3:2:1", label: "3:2:1" },
];

function porcentaje(parte, total) {
  if (!total) return 0;
  return Math.round((parte * 100) / total);
}

function contar(lista, fin) {
  return lista.filter((accion) => accion.fin === fin).length;
}

// contexto: "ATQ" o "DEF". filtro: valor de sit_ofensiva o tipo_def, o null.
export function calcularEstadisticas(todasLasAcciones, contexto, filtro) {
  const base = todasLasAcciones.filter((accion) => accion.at_def_san === contexto);
  const acciones = filtro
    ? base.filter((accion) => accion.sit_ofensiva === filtro || accion.tipo_def === filtro)
    : base;

  const totalAcciones = acciones.length;
  // gol_parada_fuera llega como "" (no como null) en las filas que no son lanzamiento.
  const lanzamientos = acciones.filter((accion) => Boolean(accion.gol_parada_fuera)).length;
  const goles = acciones.filter((accion) => accion.gol_parada_fuera === "GOL").length;
  const paradas = acciones.filter((accion) => accion.gol_parada_fuera === "PAR").length;
  const fueras = acciones.filter((accion) => accion.gol_parada_fuera === "FUE").length;

  const perdidas = contar(acciones, "PER");
  const infracciones = contar(acciones, "INF");
  const faltasAtaque = contar(acciones, "FAT");
  const faltasRecibidas = contar(acciones, "FAL");
  const bloqueos = contar(acciones, "BLQ");
  const unoVsUno = contar(acciones, "1V1");
  const dosVsDos = contar(acciones, "2V2");
  const exclusiones = contar(acciones, "2MIN");
  const penaltis = contar(acciones, "7M");
  const intercepciones = contar(acciones, "INT");

  return {
    acciones: totalAcciones,
    lanzamientos,
    pctLanzamientos: porcentaje(lanzamientos, totalAcciones),
    goles,
    pctGoles: porcentaje(goles, lanzamientos),
    paradas,
    pctParadas: porcentaje(paradas, lanzamientos),
    fueras,
    pctFueras: porcentaje(fueras, lanzamientos),
    perdidas,
    pctPerdidas: porcentaje(perdidas, totalAcciones),
    infracciones,
    pctInfracciones: porcentaje(infracciones, totalAcciones),
    faltasAtaque,
    pctFaltasAtaque: porcentaje(faltasAtaque, totalAcciones),
    faltasRecibidas,
    pctFaltasRecibidas: porcentaje(faltasRecibidas, totalAcciones),
    bloqueos,
    pctBloqueos: porcentaje(bloqueos, totalAcciones),
    unoVsUno,
    pctUnoVsUno: porcentaje(unoVsUno, totalAcciones),
    dosVsDos,
    pctDosVsDos: porcentaje(dosVsDos, totalAcciones),
    exclusiones,
    pctExclusiones: porcentaje(exclusiones, totalAcciones),
    penaltis,
    pctPenaltis: porcentaje(penaltis, totalAcciones),
    intercepciones,
    pctIntercepciones: porcentaje(intercepciones, totalAcciones),
  };
}

// Desglosa las acciones de un contexto (ATQ/DEF) según un campo (sit_ofensiva
// o tipo_def) y una lista de opciones {value,label}. Para cada opción calcula
// su peso sobre el total del contexto y, dentro de ella, el resultado de sus
// lanzamientos — es la base de las barras desplegables de Estadísticas.
export function calcularDesglosePorCampo(todasLasAcciones, contexto, campo, opciones) {
  const base = todasLasAcciones.filter((accion) => accion.at_def_san === contexto);
  const total = base.length;

  return opciones.map(({ value, label }) => {
    const acciones = base.filter((accion) => accion[campo] === value);
    const cuenta = acciones.length;
    const lanzamientos = acciones.filter((accion) => Boolean(accion.gol_parada_fuera)).length;
    const goles = acciones.filter((accion) => accion.gol_parada_fuera === "GOL").length;
    const paradas = acciones.filter((accion) => accion.gol_parada_fuera === "PAR").length;
    const fueras = acciones.filter((accion) => accion.gol_parada_fuera === "FUE").length;

    return {
      value,
      label,
      cuenta,
      porcentaje: porcentaje(cuenta, total),
      lanzamientos,
      goles,
      pctGoles: porcentaje(goles, lanzamientos),
      paradas,
      pctParadas: porcentaje(paradas, lanzamientos),
      fueras,
      pctFueras: porcentaje(fueras, lanzamientos),
    };
  });
}

// Recuento de sanciones de todo el partido (no se dividen en ataque/defensa).
export function calcularSanciones(todasLasAcciones) {
  const sanciones = todasLasAcciones.filter((accion) => accion.at_def_san === "SAN");
  return {
    exclusiones: contar(sanciones, "2MIN"),
    amarillas: contar(sanciones, "AMARILLA"),
    rojas: contar(sanciones, "ROJA"),
    azules: contar(sanciones, "AZUL"),
  };
}
