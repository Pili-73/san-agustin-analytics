// Cálculo de estadísticas a partir de la tabla `accion` (esquema nuevo).
// Cada fila de `accion` es o bien un lanzamiento (tiene `gol_parada_fuera`,
// `zona_lanz`, `zona_porteria`) o bien un evento de ataque/defensa/sanción
// (tiene `fin`). Ambos comparten `at_def_san`, `sit_ofensiva` y `tipo_def`.

import { minutosDeTiempo } from "./tiempo";
import { FIN_POR_CLAVE } from "./categoriasAccion";

// Filtra por el minuto de partido en el que se registró cada acción (según
// su `tiempo`, "mm:ss"). rango es [inicio, fin] en minutos, o null para no
// filtrar. Las acciones sin tiempo parseable se excluyen si hay filtro activo.
export function filtrarPorTiempo(acciones, rango) {
  if (!rango) return acciones;
  const [inicio, fin] = rango;
  return acciones.filter((accion) => {
    const minutos = minutosDeTiempo(accion.tiempo);
    return minutos != null && minutos >= inicio && minutos <= fin;
  });
}

// Minuto más alto registrado en el partido (para acotar la barra de
// intervalo); nunca por debajo de 60 aunque el partido lleve poco jugado.
export function calcularMaxMinutos(acciones) {
  const maximo = acciones.reduce((actual, accion) => {
    const minutos = minutosDeTiempo(accion.tiempo);
    return minutos != null ? Math.max(actual, minutos) : actual;
  }, 0);
  return Math.max(60, Math.ceil(maximo));
}

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

// Cómo terminaron las acciones que no fueron lanzamiento: la posesión cambia
// de manos, o sigue viva. Entre las dos cubren todos los tipos de evento sin
// lanzamiento, así lanzamientos+cambiosPosesion+continuidades suma el total.
function resumenPosesion(acciones) {
  return {
    cambiosPosesion:
      contar(acciones, FIN_POR_CLAVE.perdidas) +
      contar(acciones, FIN_POR_CLAVE.infracciones) +
      contar(acciones, FIN_POR_CLAVE.faltasAtaque) +
      contar(acciones, FIN_POR_CLAVE.intercepciones),
    continuidades:
      contar(acciones, FIN_POR_CLAVE.faltasRecibidas) +
      contar(acciones, FIN_POR_CLAVE.bloqueos) +
      contar(acciones, FIN_POR_CLAVE.unoVsUno) +
      contar(acciones, FIN_POR_CLAVE.dosVsDos) +
      contar(acciones, FIN_POR_CLAVE.penaltis) +
      contar(acciones, FIN_POR_CLAVE.exclusiones),
  };
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

  const perdidas = contar(acciones, FIN_POR_CLAVE.perdidas);
  const infracciones = contar(acciones, FIN_POR_CLAVE.infracciones);
  const faltasAtaque = contar(acciones, FIN_POR_CLAVE.faltasAtaque);
  const faltasRecibidas = contar(acciones, FIN_POR_CLAVE.faltasRecibidas);
  const bloqueos = contar(acciones, FIN_POR_CLAVE.bloqueos);
  const unoVsUno = contar(acciones, FIN_POR_CLAVE.unoVsUno);
  const dosVsDos = contar(acciones, FIN_POR_CLAVE.dosVsDos);
  const exclusiones = contar(acciones, FIN_POR_CLAVE.exclusiones);
  const penaltis = contar(acciones, FIN_POR_CLAVE.penaltis);
  const intercepciones = contar(acciones, FIN_POR_CLAVE.intercepciones);
  // Ya contadas arriba: sumarlas es más barato que volver a recorrer
  // `acciones` para los mismos códigos fin dentro de resumenPosesion.
  const cambiosPosesion = perdidas + infracciones + faltasAtaque + intercepciones;
  const continuidades = faltasRecibidas + bloqueos + unoVsUno + dosVsDos + penaltis + exclusiones;

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
    cambiosPosesion,
    pctCambiosPosesion: porcentaje(cambiosPosesion, totalAcciones),
    continuidades,
    pctContinuidades: porcentaje(continuidades, totalAcciones),
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
    const { cambiosPosesion, continuidades } = resumenPosesion(acciones);

    return {
      value,
      label,
      cuenta,
      porcentaje: porcentaje(cuenta, total),
      lanzamientos,
      pctLanzamientos: porcentaje(lanzamientos, cuenta),
      goles,
      pctGoles: porcentaje(goles, lanzamientos),
      paradas,
      pctParadas: porcentaje(paradas, lanzamientos),
      fueras,
      pctFueras: porcentaje(fueras, lanzamientos),
      cambiosPosesion,
      pctCambiosPosesion: porcentaje(cambiosPosesion, cuenta),
      continuidades,
      pctContinuidades: porcentaje(continuidades, cuenta),
    };
  });
}

function zonasVacias() {
  return Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, { goles: 0, lanzamientos: 0 }]));
}

// Goles/lanzamientos por cada una de las 9 zonas de lanzamiento y de las 9
// zonas de portería, para el mapa de eficacia visual. En ataque son los
// lanzamientos propios; en defensa, los recibidos por el portero (eficacia
// de portería en defensa).
export function calcularEficaciaPorZonas(todasLasAcciones, contexto) {
  const lanzamientos = todasLasAcciones.filter(
    (accion) => accion.at_def_san === contexto && Boolean(accion.gol_parada_fuera)
  );

  const porZonaLanz = zonasVacias();
  const porZonaPorteria = zonasVacias();

  for (const accion of lanzamientos) {
    const esGol = accion.gol_parada_fuera === "GOL";
    if (accion.zona_lanz && porZonaLanz[accion.zona_lanz]) {
      porZonaLanz[accion.zona_lanz].lanzamientos += 1;
      if (esGol) porZonaLanz[accion.zona_lanz].goles += 1;
    }
    if (accion.zona_porteria && porZonaPorteria[accion.zona_porteria]) {
      porZonaPorteria[accion.zona_porteria].lanzamientos += 1;
      if (esGol) porZonaPorteria[accion.zona_porteria].goles += 1;
    }
  }

  return { porZonaLanz, porZonaPorteria };
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

// Todo el bloque de estadísticas derivadas de una lista de acciones ya
// filtrada (un partido o una temporada entera, de todo el equipo o de un
// jugador ya acotado): es la misma "hoja" que consumen la pantalla de
// partido general, la de jugador y la de temporada, sea cual sea el origen.
export function calcularHojaCompleta(acciones) {
  // Un solo filtrado del subconjunto de 7m, reutilizado en ataque y defensa
  // (antes se filtraba dos veces con el mismo predicado).
  const acciones7m = acciones.filter((accion) => accion.sit_ofensiva === "7M");

  return {
    estadisticasAtaque: calcularEstadisticas(acciones, "ATQ", null),
    estadisticasDefensa: calcularEstadisticas(acciones, "DEF", null),
    sanciones: calcularSanciones(acciones),
    desgloseSituacionAtaque: calcularDesglosePorCampo(acciones, "ATQ", "sit_ofensiva", FILTROS_SITUACION),
    desgloseSituacionDefensa: calcularDesglosePorCampo(acciones, "DEF", "sit_ofensiva", FILTROS_SITUACION),
    desgloseFormacionAtaque: calcularDesglosePorCampo(acciones, "ATQ", "tipo_def", FILTROS_DEFENSA),
    desgloseFormacionDefensa: calcularDesglosePorCampo(acciones, "DEF", "tipo_def", FILTROS_DEFENSA),
    eficaciaZonasAtaque: calcularEficaciaPorZonas(acciones, "ATQ"),
    eficaciaZonasDefensa: calcularEficaciaPorZonas(acciones, "DEF"),
    eficaciaZonas7mAtaque: calcularEficaciaPorZonas(acciones7m, "ATQ"),
    eficaciaZonas7mDefensa: calcularEficaciaPorZonas(acciones7m, "DEF"),
  };
}

// Minutos jugados por un jugador en UN partido, a partir de sus filas de
// sustitución (at_def_san "SUS", fin "IN"/"OUT") y de los marcadores de fin
// de partido/1ª parte de ese mismo partido (fin "FINP"/"FIN1", sin
// id_jugador). acciones: todas las de ese partido (sin filtrar por jugador,
// para poder ver esos marcadores). Empareja entradas y salidas en orden; una
// entrada sin salida (se acabó el partido, o se cerró la app, con el
// jugador en pista) se cierra en el marcador de fin de partido si existe,
// si no en el de fin de 1ª parte (30:00), y si no hay ninguno de los dos en
// la última acción registrada del partido (lo último que se sabe seguro).
export function calcularMinutosJugador(acciones, jugadorId) {
  const cambios = acciones
    .filter((accion) => accion.at_def_san === "SUS" && accion.id_jugador === jugadorId && (accion.fin === "IN" || accion.fin === "OUT"))
    .map((accion) => ({ tipo: accion.fin, minutos: minutosDeTiempo(accion.tiempo) }))
    .filter((cambio) => cambio.minutos != null)
    .sort((a, b) => a.minutos - b.minutos);

  const finPartido = acciones.find((accion) => accion.at_def_san === "SUS" && accion.fin === "FINP");
  const finPrimeraParte = acciones.find((accion) => accion.at_def_san === "SUS" && accion.fin === "FIN1");
  const techo = finPartido
    ? minutosDeTiempo(finPartido.tiempo)
    : finPrimeraParte
    ? 30
    : calcularMaxMinutos(acciones);

  const intervalos = [];
  let inicio = null;
  for (const cambio of cambios) {
    if (cambio.tipo === "IN" && inicio == null) inicio = cambio.minutos;
    else if (cambio.tipo === "OUT" && inicio != null) {
      intervalos.push([inicio, cambio.minutos]);
      inicio = null;
    }
    // Entradas/salidas duplicadas por error (dos IN seguidos, un OUT sin
    // IN previo) se ignoran en vez de romper el emparejamiento.
  }
  if (inicio != null) intervalos.push([inicio, Math.max(inicio, techo)]);

  const totalMinutos = intervalos.reduce((suma, [ini, fin]) => suma + (fin - ini), 0);
  return { intervalos, totalMinutos };
}

// Suma de minutos jugados por un jugador a lo largo de varios partidos (p.ej.
// toda una temporada, ya filtrada por fecha): calcula el emparejamiento
// IN/OUT por separado en cada partido -no se puede mezclar acciones de
// partidos distintos- y suma los totales.
export function calcularMinutosTemporada(acciones, jugadorId) {
  const porPartido = new Map();
  for (const accion of acciones) {
    if (!porPartido.has(accion.id_partido)) porPartido.set(accion.id_partido, []);
    porPartido.get(accion.id_partido).push(accion);
  }
  let total = 0;
  for (const accionesPartido of porPartido.values()) {
    total += calcularMinutosJugador(accionesPartido, jugadorId).totalMinutos;
  }
  return total;
}

// Filtra acciones de varios partidos por la fecha del partido al que
// pertenece cada una (no existe fecha en `accion`, solo el minuto de
// partido en `tiempo`). partidoPorId: { [id_partido]: { fecha, ... } }.
// rango: [fechaInicioISO, fechaFinISO], o null para no filtrar.
export function filtrarPorFecha(acciones, partidoPorId, rango) {
  if (!rango) return acciones;
  const [inicio, fin] = rango;
  return acciones.filter((accion) => {
    const fecha = partidoPorId[accion.id_partido]?.fecha;
    return fecha != null && fecha >= inicio && fecha <= fin;
  });
}

// Primera y última fecha entre los partidos de un equipo (para acotar la
// barra de intervalo de temporada). Si no hay partidos, devuelve hoy dos veces.
export function calcularRangoFechas(partidos) {
  const fechas = partidos.map((partido) => partido.fecha).filter(Boolean).sort();
  if (fechas.length === 0) {
    const hoy = new Date().toISOString().slice(0, 10);
    return [hoy, hoy];
  }
  return [fechas[0], fechas[fechas.length - 1]];
}
