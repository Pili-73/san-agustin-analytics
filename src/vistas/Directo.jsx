import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerEquipo } from "../datos/equipos";
import { listarJugadoresEquipo } from "../datos/jugadores";
import { obtenerPartido } from "../datos/partidos";
import { listarAccionesPartido } from "../datos/acciones";
import { usePartidoEnDirecto } from "../estado/usePartidoEnDirecto";
import { useConfirmacion } from "../estado/useConfirmacion";
import { useOpcionesAccion } from "../estado/useOpcionesAccion";
import { formatearTiempo, minutosDeTiempo, msDeTiempo } from "../utils/tiempo";
import { borrarEstadoDirecto, guardarEstadoDirecto, leerEstadoDirecto } from "../utils/estadoDirecto";
import { ZONAS_LANZAMIENTO } from "../utils/zonasCampo";
import { esExclusionRival, estadoNumerico, exclusionesActivas } from "../utils/exclusiones";
import BarraMarcador from "../piezas/partido/BarraMarcador";
import Modal from "../piezas/comun/Modal";
import Toast from "../piezas/comun/Toast";
import IndicadorAccion from "../piezas/comun/IndicadorAccion";
import "../estilos/Directo.css";

const SITUACIONES = [
  { valor: "CGOL", texto: "Contragol", imagen: "/contragol.jpg" },
  { valor: "1OL", texto: "1ª oleada", imagen: "/1_oleada.jpg" },
  { valor: "2OL", texto: "2ª oleada", imagen: "/2_oleada.jpg" },
  { valor: "POS", texto: "Posicional", imagen: "/posicional.jpg" },
  { valor: "7M", texto: "7 m", imagen: "/7m.jpg" },
];

// Grupo de sanciones: fijo, fuera del catálogo configurable por equipo.
const GRUPO_SAN = {
  codigo: "SAN",
  titulo: "Sanciones",
  opciones: [
    ["2MIN", "2 min", "gris"], ["AMARILLA", "Amarilla", "amarillo"],
    ["ROJA", "Roja", "rojo"], ["AZUL", "Azul", "azul"],
  ],
};

const TIPOS_DEFENSA = ["6:0", "5:1", "3:3", "3:2:1"];

export default function Directo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const partidoId = Number(id);
  const partidoEnDirecto = usePartidoEnDirecto(partidoId);
  const { confirmar, dialogo: dialogoConfirmacion } = useConfirmacion();
  const [partido, setPartido] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [campoIds, setCampoIds] = useState([]);
  const [banquilloIds, setBanquilloIds] = useState([]);
  const [zonaPorteria, setZonaPorteria] = useState(null);
  const [zonaLanz, setZonaLanz] = useState(null);
  const [situacion, setSituacion] = useState("POS");
  const [tipoDefPropio, setTipoDefPropio] = useState("6:0");
  const [tipoDefRival, setTipoDefRival] = useState("6:0");
  const [parte, setParte] = useState(1);
  const [menuMarcador, setMenuMarcador] = useState(false);
  const [editarTiempo, setEditarTiempo] = useState(false);
  const [minInput, setMinInput] = useState("0");
  const [segInput, setSegInput] = useState("0");
  const [tiempoMuerto, setTiempoMuerto] = useState(false);
  const [grupoAbierto, setGrupoAbierto] = useState(null);
  const [errorCarga, setErrorCarga] = useState("");
  // Sanciones del partido (las nuestras, en Sanciones, y los 2 min del rival,
  // en ataque): de aquí salen las exclusiones en curso con su cuenta atrás,
  // la superioridad/inferioridad y los iconos de cada jugador en la lista.
  const [sanciones, setSanciones] = useState([]);
  // Motivo por el que se ha abierto solo el menú del cronómetro (reloj
  // parado por una sanción); null si lo abrió el usuario.
  const [avisoMenu, setAvisoMenu] = useState(null);
  // Última acción guardada, para que "Deshacer" revierta también lo que se
  // hizo solo al guardarla (quitarla de las sanciones, devolver al campo al
  // jugador que se mandó al banquillo).
  const ultimaGuardadaRef = useRef(null);
  const { opcionesPorContexto } = useOpcionesAccion(equipo?.id);

  useEffect(() => {
    let activo = true;
    Promise.resolve().then(async () => {
      const partidoCargado = await obtenerPartido(partidoId);
      const [equipoCargado, jugadoresCargados] = await Promise.all([
        obtenerEquipo(partidoCargado.id_equipo),
        listarJugadoresEquipo(partidoCargado.id_equipo),
      ]);
      if (!activo) return;
      // Sin conexión y sin copia guardada se sigue igual (solo faltarían las
      // sanciones previas); el camino sin snapshot sí necesita las acciones
      // y vuelve a pedirlas más abajo, fallando como antes.
      const accionesPartido = await listarAccionesPartido(partidoId).catch(() => null);
      if (!activo) return;
      setPartido(partidoCargado);
      setEquipo(equipoCargado);
      setJugadores(jugadoresCargados);
      setSanciones((accionesPartido || []).filter(esSancion));

      // Si venimos de consultar Estadísticas, reanudamos el partido tal como estaba.
      const guardado = leerEstadoDirecto(partidoId);
      if (guardado) {
        const idsValidos = new Set(jugadoresCargados.map((jugador) => jugador.id));
        const campoGuardado = (guardado.campoIds || []).filter((id) => idsValidos.has(id));
        const banquilloGuardado = (guardado.banquilloIds || []).filter((id) => idsValidos.has(id));
        setCampoIds(campoGuardado.length ? campoGuardado : jugadoresCargados.slice(0, 7).map((j) => j.id));
        setBanquilloIds(banquilloGuardado.length ? banquilloGuardado : jugadoresCargados.slice(7).map((j) => j.id));
        setTipoDefPropio(guardado.tipoDefPropio || "6:0");
        setTipoDefRival(guardado.tipoDefRival || "6:0");
        // Si el reloj seguía corriendo al salir a Estadísticas, sumamos el
        // tiempo real transcurrido desde entonces (no se congela mientras no se ve).
        const msTranscurridos = guardado.running && guardado.guardadoEnMs
          ? (guardado.elapsedMs || 0) + (Date.now() - guardado.guardadoEnMs)
          : (guardado.elapsedMs || 0);
        partidoEnDirecto.restaurarCronometro(msTranscurridos, !!guardado.running);
        partidoEnDirecto.restaurarMarcador(guardado.golesAgustinos, guardado.golesRival);
        setParte(guardado.parte || 1);
      } else {
        // Al iniciar o reanudar un partido, todos los jugadores empiezan en
        // el banquillo: el entrenador sube con la flecha a los que salen de inicio.
        setCampoIds([]);
        setBanquilloIds(jugadoresCargados.map((jugador) => jugador.id));

        // Sin snapshot de sesión (partido recién creado, o se volvió a abrir
        // tras cerrar la app a mitad desde "Reanudar partido"): reconstruimos
        // reloj, parte y marcador a partir de lo que ya haya en la base de
        // datos. En un partido sin acciones todavía esto no cambia nada
        // (sigue arrancando en 0:00, 1ª parte, 0-0).
        const acciones = accionesPartido ?? (await listarAccionesPartido(partidoId));
        if (!activo) return;
        const ultimaAccion = acciones.reduce((actual, accion) => {
          const minutos = minutosDeTiempo(accion.tiempo);
          return minutos != null && (!actual || minutos > actual.minutos) ? { accion, minutos } : actual;
        }, null);
        if (ultimaAccion) {
          partidoEnDirecto.restaurarCronometro(msDeTiempo(ultimaAccion.accion.tiempo), false);
          setParte(ultimaAccion.minutos >= 30 ? 2 : 1);
        }
        const golesAgustinos = acciones.filter((accion) => accion.at_def_san === "ATQ" && accion.gol_parada_fuera === "GOL").length;
        const golesRival = acciones.filter((accion) => accion.at_def_san === "DEF" && accion.gol_parada_fuera === "GOL").length;
        partidoEnDirecto.restaurarMarcador(golesAgustinos, golesRival);
      }
    }).catch((err) => {
      console.error("Error cargando el partido en directo", err);
      if (activo) setErrorCarga("No se pudieron cargar los datos del partido.");
    });
    return () => { activo = false; };
  }, [partidoId]);

  const jugadoresPorId = useMemo(
    () => Object.fromEntries(jugadores.map((jugador) => [jugador.id, jugador])),
    [jugadores]
  );
  const jugadoresCampo = useMemo(
    () => campoIds.map((id) => jugadoresPorId[id]).filter(Boolean),
    [campoIds, jugadoresPorId]
  );
  const jugadoresBanquillo = useMemo(
    () => banquilloIds.map((id) => jugadoresPorId[id]).filter(Boolean),
    [banquilloIds, jugadoresPorId]
  );
  // Los grupos Ataque/Defensa salen del catálogo configurado por el equipo
  // (ver Configuración); Sanciones se queda fijo.
  const gruposAccion = useMemo(
    () => [
      {
        codigo: "ATQ",
        titulo: "Ataque",
        opciones: opcionesPorContexto.ATQ.map((opcion) => [opcion.fin, opcion.titulo, opcion.color]),
      },
      {
        codigo: "DEF",
        titulo: "Defensa",
        opciones: opcionesPorContexto.DEF.map((opcion) => [opcion.fin, opcion.titulo, opcion.color]),
      },
      GRUPO_SAN,
    ],
    [opcionesPorContexto]
  );

  const jugadorSeleccionado = jugadores.find((jugador) => jugador.id === seleccionado);
  const exclusiones = exclusionesActivas(sanciones, partidoEnDirecto.elapsedMs);
  const situacionNumerica = estadoNumerico(exclusiones.agustinos.length, exclusiones.rival.length);
  const sancionesPorJugador = useMemo(() => iconosSancionPorJugador(sanciones), [sanciones]);
  const esPorteroSeleccionado = jugadorSeleccionado?.posicion?.toLowerCase() === "portero";
  const puedeGuardarLanzamiento = !partidoEnDirecto.guardando;
  const totalPendientes = partidoEnDirecto.pendientes.length + partidoEnDirecto.pendientesBorrado;

  // Cambiar de jugador (o deseleccionarlo, pulsando el que ya estaba
  // marcado) cierra cualquier desplegable de ataque/defensa/sanción que
  // hubiera quedado abierto: sus opciones eran para el jugador anterior.
  const seleccionarJugador = (id) => {
    setSeleccionado((actual) => (actual === id ? null : id));
    setGrupoAbierto(null);
  };

  // Un clic en la flecha pasa al jugador a la otra lista (se coloca al
  // final) y registra la entrada ("IN") o salida ("OUT") para los minutos
  // jugados. Sustituye al arrastre: con un clic no hay cambios accidentales.
  const moverJugador = (idJugador, origen) => {
    if (origen === "banquillo") {
      setBanquilloIds((ids) => ids.filter((id) => id !== idJugador));
      setCampoIds((ids) => [...ids, idJugador]);
      partidoEnDirecto.guardarCambioJugador(idJugador, "IN");
    } else {
      setCampoIds((ids) => ids.filter((id) => id !== idJugador));
      setBanquilloIds((ids) => [...ids, idJugador]);
      partidoEnDirecto.guardarCambioJugador(idJugador, "OUT");
    }
  };

  // Deshace la última acción y lo que se hizo solo al guardarla: si era una
  // sanción deja de contar, y si mandó a un jugador al banquillo vuelve al
  // campo (si sigue en el banquillo).
  const deshacer = async () => {
    const ultima = ultimaGuardadaRef.current;
    const deshecha = await partidoEnDirecto.deshacerUltimaAccion();
    if (!deshecha || !ultima) return;
    setSanciones((actuales) => actuales.filter((accion) => accion !== ultima.accion));
    if (ultima.jugadorAlBanquillo != null && banquilloIds.includes(ultima.jugadorAlBanquillo)) {
      moverJugador(ultima.jugadorAlBanquillo, "banquillo");
    }
    ultimaGuardadaRef.current = null;
  };

  const tipoDefPara = (codigo) => {
    if (codigo === "ATQ") return tipoDefRival;
    if (codigo === "DEF") return tipoDefPropio;
    return null;
  };

  const guardarEvento = async (codigo, fin) => {
    const guardada = await partidoEnDirecto.guardarAccion({
      id_jugador: jugadorSeleccionado ? jugadorSeleccionado.id : null,
      at_def_san: codigo,
      fin,
      sit_ofensiva: situacion,
      tipo_def: tipoDefPara(codigo),
    });
    if (guardada) {
      setSituacion("POS");
      setSeleccionado(null);
      if (esSancion(guardada.accion)) setSanciones((actuales) => [...actuales, guardada.accion]);
      ultimaGuardadaRef.current = { accion: guardada.accion, jugadorAlBanquillo: null };
      if (paraElReloj(guardada.accion)) {
        partidoEnDirecto.pausarCronometro();
        // Si la sanción es de uno de los nuestros que está en el campo, sale
        // al banquillo (y se registra su salida para los minutos jugados).
        // Volver a entrar es manual, con su flecha: puede entrar otro.
        const jugador =
          codigo === "SAN" && jugadorSeleccionado && campoIds.includes(jugadorSeleccionado.id) ? jugadorSeleccionado : null;
        if (jugador) {
          moverJugador(jugador.id, "campo");
          ultimaGuardadaRef.current.jugadorAlBanquillo = jugador.id;
        }
        const mensaje = mensajeRelojParado(guardada.accion, jugador, guardada.pendiente);
        partidoEnDirecto.mostrarAviso(mensaje, "aviso");
        setAvisoMenu(mensaje);
        setMenuMarcador(true);
      }
    }
    setGrupoAbierto(null);
  };

  const guardarLanzamiento = async (resultado) => {
    const esPortero = jugadorSeleccionado?.posicion?.toLowerCase() === "portero";
    const tipoAccion = esPortero ? "DEF" : "ATQ";
    const guardada = await partidoEnDirecto.guardarAccion({
      id_jugador: jugadorSeleccionado ? jugadorSeleccionado.id : null,
      at_def_san: tipoAccion,
      sit_ofensiva: situacion,
      tipo_def: tipoDefPara(tipoAccion),
      zona_lanz: zonaLanz,
      zona_porteria: zonaPorteria,
      gol_parada_fuera: resultado,
    });
    if (guardada) {
      ultimaGuardadaRef.current = { accion: guardada.accion, jugadorAlBanquillo: null };
      setZonaLanz(null);
      setZonaPorteria(null);
      setSituacion("POS");
      setSeleccionado(null);
    }
  };

  const abrirEditarTiempo = () => {
    const segundos = Math.floor(partidoEnDirecto.elapsedMs / 1000);
    setMinInput(String(Math.floor(segundos / 60)));
    setSegInput(String(segundos % 60));
    setMenuMarcador(false);
    setEditarTiempo(true);
  };

  const confirmarTiempo = () => {
    partidoEnDirecto.establecerTiempoManual(parseInt(minInput, 10) || 0, parseInt(segInput, 10) || 0);
    setEditarTiempo(false);
  };

  const alternarTiempoMuerto = () => {
    if (!tiempoMuerto) partidoEnDirecto.pausarCronometro();
    setTiempoMuerto((actual) => !actual);
    setMenuMarcador(false);
  };

  // El reloj sigue corriendo en continuo (0-60, no se reinicia por parte):
  // así el tiempo guardado en cada acción sitúa la 2ª parte en el minuto 30
  // en adelante, que es lo que usa el filtro de tiempo de Estadísticas.
  const finalizarPrimerTiempo = async () => {
    if (!(await confirmar("¿Finalizar el primer tiempo?"))) return;
    partidoEnDirecto.pausarCronometro();
    partidoEnDirecto.establecerTiempoManual(30, 0);
    partidoEnDirecto.guardarMarcadorFin("FIN1", "30:00");
    setParte(2);
    setMenuMarcador(false);
    // Se guarda aquí mismo (no solo al ir a Estadísticas): si el cronómetro
    // no llegara a fijarse a 30:00 por cualquier motivo, al menos el
    // marcador y el resto del estado quedan a salvo tal como estaban.
    guardarEstadoDirecto(partidoId, {
      elapsedMs: 30 * 60 * 1000,
      golesAgustinos: partidoEnDirecto.marcador.golesAgustinos,
      golesRival: partidoEnDirecto.marcador.golesRival,
      tipoDefPropio,
      tipoDefRival,
      campoIds,
      banquilloIds,
      parte: 2,
    });
  };

  const verEstadisticas = (ruta) => {
    guardarEstadoDirecto(partidoId, {
      elapsedMs: partidoEnDirecto.elapsedMs,
      running: partidoEnDirecto.running,
      guardadoEnMs: Date.now(),
      golesAgustinos: partidoEnDirecto.marcador.golesAgustinos,
      golesRival: partidoEnDirecto.marcador.golesRival,
      tipoDefPropio,
      tipoDefRival,
      campoIds,
      banquilloIds,
      parte,
    });
    // replace (no push): así, al volver de Estadísticas, no queda una
    // entrada de historial extra que se sume a la trampa del botón atrás
    // (ver más abajo) y se vaya acumulando en cada ida y vuelta.
    navigate(ruta, { replace: true });
  };

  const mensajeConfirmarFin = () => {
    const avisoPendientes = totalPendientes
      ? `\n\nOjo: quedan ${totalPendientes} cambios sin subir (sin conexión). Se guardarán solos en cuanto vuelva la red; hasta entonces solo se ven en Estadísticas desde este mismo dispositivo.`
      : "";
    return `¿Estás seguro de acabar el partido?${avisoPendientes}`;
  };

  // Aviso al pulsar atrás: distinto del de "Fin partido" -salir por atrás no
  // acaba el partido, solo lo deja tal cual para reanudarlo luego-.
  const mensajeConfirmarSalir = () => {
    const avisoPendientes = totalPendientes
      ? `\n\nOjo: quedan ${totalPendientes} cambios sin subir (sin conexión). Se guardarán solos en cuanto vuelva la red; hasta entonces solo se ven en Estadísticas desde este mismo dispositivo.`
      : "";
    return `¿Salir sin finalizar el partido? Podrás reanudarlo más tarde tal como está.${avisoPendientes}`;
  };

  // Guarda el estado final y sustituye (no añade) la entrada actual del
  // historial por el inicio de la app: así, se llegue por el botón "Fin
  // partido" -en un partido normal o reanudado-, no queda ninguna entrada de
  // Directo ni del listado de partidos enterrada debajo sobre la que el
  // botón atrás pueda volver a caer -esa es la causa del bucle
  // Directo↔listado que reportaste-. Solo se llama desde el botón "Fin
  // partido" (directo, o su autorización de un solo popstate vía
  // finalizacionAutorizadaRef); pulsar atrás sin pasar por ese botón usa
  // salirYNavegar en su lugar, que no marca el partido como finalizado.
  const finalizarYNavegar = () => {
    partidoEnDirecto.pausarCronometro();
    // Igual que "Fin primer tiempo" fija el reloj a 30:00 aunque llevara
    // otro tiempo marcado, aquí se fija a 60:00: el cronómetro del
    // entrenador puede llevar un pequeño desajuste (pausas, tiempos
    // muertos...), pero al pulsar "Fin partido" el partido se da por
    // acabado en el minuto 60 oficial, no en lo que marcase el reloj.
    partidoEnDirecto.establecerTiempoManual(60, 0);
    // Quien siga en el campo al acabar el partido no tiene salida propia:
    // sin este cierre explícito, sus minutos dependían de que el cálculo de
    // estadísticas adivinara el corte a partir del marcador de fin, y
    // cualquier fallo ahí (o un fin de partido accidental previo) los dejaba
    // sin contar hasta el final real. Se cierra cada uno con su propio
    // "OUT" a los 60:00, igual que si hubiera salido al banquillo. "60:00"
    // va explícito (no basta con el establecerTiempoManual de arriba) porque
    // el estado del reloj todavía no se habrá actualizado a tiempo para esta
    // misma función síncrona.
    campoIds.forEach((idJugador) => partidoEnDirecto.guardarCambioJugador(idJugador, "OUT", "60:00"));
    partidoEnDirecto.guardarMarcadorFin("FINP", "60:00");
    borrarEstadoDirecto(partidoId);
    navigate("/", { replace: true });
  };

  // Salir por el botón atrás sin pasar por "Fin partido": no escribe FINP ni
  // cierra a nadie con un "OUT" -el partido no se da por acabado-, solo
  // guarda el mismo snapshot resumible que usa "ver Estadísticas" para que
  // "Reanudar partido" lo recupere tal cual se dejó.
  const salirYNavegar = () => {
    partidoEnDirecto.pausarCronometro();
    guardarEstadoDirecto(partidoId, {
      elapsedMs: partidoEnDirecto.elapsedMs,
      golesAgustinos: partidoEnDirecto.marcador.golesAgustinos,
      golesRival: partidoEnDirecto.marcador.golesRival,
      tipoDefPropio,
      tipoDefRival,
      campoIds,
      banquilloIds,
      parte,
    });
    navigate("/", { replace: true });
  };

  // El botón no puede sustituir directamente la entrada actual: mientras no
  // se ha pulsado atrás, esa entrada sigue siendo la "trampa" añadida al
  // montar (ver más abajo), y debajo de ella seguiría la entrada real de
  // Directo. En vez de eso, se autoriza el siguiente popstate y se dispara
  // uno mismo (atrás programático): así se reutiliza el mismo punto del
  // historial -y la misma sustitución- que usa el aviso al pulsar atrás.
  const finalizarPartido = async () => {
    if (!(await confirmar(mensajeConfirmarFin()))) return;
    finalizacionAutorizadaRef.current = true;
    window.history.back();
  };

  // Refs (no closures) para que el listener de popstate, montado una sola
  // vez, siempre use la versión más reciente de estas funciones (con el
  // partido/pendientes actuales) en vez de quedarse con la del primer render.
  const finalizarYNavegarRef = useRef(finalizarYNavegar);
  const salirYNavegarRef = useRef(salirYNavegar);
  const mensajeConfirmarSalirRef = useRef(mensajeConfirmarSalir);
  const finalizacionAutorizadaRef = useRef(false);
  useEffect(() => {
    finalizarYNavegarRef.current = finalizarYNavegar;
    salirYNavegarRef.current = salirYNavegar;
    mensajeConfirmarSalirRef.current = mensajeConfirmarSalir;
  });

  // Botón atrás del móvil/tablet/navegador: sale sin finalizar el partido
  // (aviso propio, distinto del de "Fin partido"). Se añade una entrada
  // extra al historial al entrar; al pulsar atrás se consume esa entrada
  // (sin salir de verdad) y se muestra el aviso. Si el usuario cancela, se
  // repone la entrada para poder atraparlo otra vez.
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const onPopState = async () => {
      if (finalizacionAutorizadaRef.current) {
        finalizacionAutorizadaRef.current = false;
        finalizarYNavegarRef.current();
        return;
      }
      if (await confirmar(mensajeConfirmarSalirRef.current())) {
        salirYNavegarRef.current();
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <main className="partido-directo">
      <BarraMarcador
        equipo={equipo?.nombre}
        rival={partido?.rival}
        marcador={partidoEnDirecto.marcador}
        tiempo={formatearTiempo(partidoEnDirecto.elapsedMs)}
        tiempoMuerto={tiempoMuerto}
        parte={parte}
        situacionNumerica={situacionNumerica}
        onAbrirMenu={() => {
          setAvisoMenu(null);
          setMenuMarcador(true);
        }}
      />

      {errorCarga && <p className="estado-carga texto-error">{errorCarga}</p>}
      {!errorCarga && !partido && <p className="estado-carga">Cargando partido…</p>}
      {partido && <div className="directo__contenido">
        <aside className="plantilla-directo">
          <h2>Plantilla</h2>
          <ListaJugadores
            titulo="En el campo"
            lista="campo"
            jugadores={jugadoresCampo}
            seleccionado={seleccionado}
            onSeleccionar={seleccionarJugador}
            onMover={moverJugador}
            sancionesPorJugador={sancionesPorJugador}
          />
          <div className="plantilla-directo__separador">BANQUILLO</div>
          <ListaJugadores
            titulo=""
            lista="banquillo"
            jugadores={jugadoresBanquillo}
            seleccionado={seleccionado}
            onSeleccionar={seleccionarJugador}
            onMover={moverJugador}
            sancionesPorJugador={sancionesPorJugador}
          />
        </aside>

        <section className="panel-directo">
          <div className="tipos-defensa-envoltorio">
            <Toast
              key={partidoEnDirecto.avisoId}
              mensaje={partidoEnDirecto.aviso}
              tipo={partidoEnDirecto.avisoTipo}
              onDismiss={partidoEnDirecto.limpiarAviso}
            />
            <div className="tipos-defensa">
              <div className="tipos-defensa__lado">
                <label className="tipos-defensa__pill tipos-defensa__pill--propia">
                  D. Agustinos
                  <select value={tipoDefPropio} onChange={(event) => setTipoDefPropio(event.target.value)}>
                    {TIPOS_DEFENSA.map((tipo) => <option key={tipo}>{tipo}</option>)}
                  </select>
                </label>
                <ExclusionesEnCurso exclusiones={exclusiones.agustinos} />
              </div>
              <div className="tipos-defensa__lado">
                <label className="tipos-defensa__pill tipos-defensa__pill--rival">
                  D. rival
                  <select value={tipoDefRival} onChange={(event) => setTipoDefRival(event.target.value)}>
                    {TIPOS_DEFENSA.map((tipo) => <option key={tipo}>{tipo}</option>)}
                  </select>
                </label>
                <ExclusionesEnCurso exclusiones={exclusiones.rival} />
              </div>
            </div>
          </div>

          {/* En pantallas anchas y bajas (tablet horizontal, ordenador) esta fila se
              oculta y aparece la copia flotante de dentro de zona-juego en su lugar:
              así la portería recupera ese hueco y se ve más grande. */}
          <BotonesLanzamiento
            className="acciones-lanzamiento acciones-lanzamiento--flujo"
            puedeGuardar={puedeGuardarLanzamiento}
            onGuardar={guardarLanzamiento}
          />

          <div className={`zona-juego ${esPorteroSeleccionado ? "zona-juego--portero" : ""}`}>
            <img src="/porteria_estadisticas.jpg" alt="Portería y zonas de lanzamiento" />
            <SelectorCuadrantes clase="selector-cuadrantes--porteria" etiqueta="Zona de portería" valor={zonaPorteria} onChange={setZonaPorteria} />
            <SelectorZonasLanz valor={zonaLanz} onChange={setZonaLanz} />
            <BotonesLanzamiento
              className="acciones-lanzamiento acciones-lanzamiento--flotante"
              puedeGuardar={puedeGuardarLanzamiento}
              onGuardar={guardarLanzamiento}
            />
          </div>

          <section className="acciones-jugador" aria-label="Acciones del jugador seleccionado">
            <div className="acciones-jugador__cabecera">
              <p>{jugadorSeleccionado ? `Jugador: ${jugadorSeleccionado.nombre} ${jugadorSeleccionado.apellido}` : "Sin jugador seleccionado (se anotará en la hoja general)"}</p>
              <div className="acciones-jugador__estado">
                {totalPendientes > 0 && (
                  <span className="badge-pendientes" title="Cambios guardados localmente, a la espera de conexión">
                    📡 {totalPendientes} pendiente{totalPendientes > 1 ? "s" : ""}
                  </span>
                )}
                {partidoEnDirecto.puedeDeshacer && (
                  <button
                    type="button"
                    className="btn-deshacer"
                    onClick={deshacer}
                    disabled={partidoEnDirecto.guardando}
                  >
                    ↩ Deshacer
                  </button>
                )}
              </div>
            </div>
            <div className="acciones-jugador__grupos">
              {gruposAccion.map((grupo) => (
                <div className={`grupo-accion grupo-accion--${grupo.codigo.toLowerCase()}`} key={grupo.codigo}>
                  <button type="button" className="grupo-accion__cabecera" onClick={() => setGrupoAbierto((actual) => actual === grupo.codigo ? null : grupo.codigo)}>
                    {grupo.titulo}
                    <span className="grupo-accion__flecha" aria-hidden="true">{grupoAbierto === grupo.codigo ? "▲" : "▼"}</span>
                  </button>
                  {grupoAbierto === grupo.codigo && <div className="grupo-accion__opciones">
                    {grupo.opciones.map(([fin, texto, color]) => <button type="button" key={`${grupo.codigo}-${fin}`} onClick={() => guardarEvento(grupo.codigo, fin)} disabled={partidoEnDirecto.guardando}><IndicadorAccion codigo={grupo.codigo} fin={fin} color={color} /><span className="grupo-accion__texto">{texto}</span></button>)}
                  </div>}
                </div>
              ))}
            </div>
          </section>

          <section className="situaciones" aria-label="Situación ofensiva">
            {SITUACIONES.map((item) => <button type="button" key={item.valor} className={`situaciones__${item.valor.toLowerCase()} ${situacion === item.valor ? "is-selected" : ""}`} onClick={() => setSituacion(item.valor)}><img src={item.imagen} alt="" /><span>{item.texto}</span></button>)}
          </section>
        </section>
      </div>}

      {menuMarcador && <Modal title="Opciones del partido" onClose={() => setMenuMarcador(false)}>
        <div className="menu-marcador">
          {avisoMenu && <p className="menu-marcador__aviso" role="status">⏸ {avisoMenu}</p>}
          <button type="button" onClick={partidoEnDirecto.running ? partidoEnDirecto.pausarCronometro : partidoEnDirecto.iniciarCronometro}>
            <span aria-hidden="true">{partidoEnDirecto.running ? "⏸" : "▶"}</span>{partidoEnDirecto.running ? "Pausar reloj" : "Iniciar reloj"}
          </button>
          <button type="button" onClick={alternarTiempoMuerto}>
            <span aria-hidden="true">⏱</span>{tiempoMuerto ? "Finalizar tiempo muerto" : "Tiempo muerto"}
          </button>
          <button type="button" onClick={abrirEditarTiempo}>
            <span aria-hidden="true">✎</span>Editar tiempo
          </button>
          <button type="button" onClick={() => verEstadisticas(`/partidos/${partidoId}/estadisticas`)}>
            <span aria-hidden="true">📊</span>Estadísticas generales
          </button>
          <button type="button" onClick={() => verEstadisticas(`/partidos/${partidoId}/estadisticas/jugador`)}>
            <span aria-hidden="true">🧍</span>Estadísticas por jugador
          </button>
          {parte === 1 && <button type="button" className="menu-marcador__parte" onClick={finalizarPrimerTiempo}>
            <span aria-hidden="true">⏭</span>Fin primer tiempo
          </button>}
          <button type="button" className="menu-marcador__peligro" onClick={finalizarPartido}>
            <span aria-hidden="true">■</span>Fin partido
          </button>
        </div>
      </Modal>}
      {editarTiempo && <Modal title="Editar tiempo" onClose={() => setEditarTiempo(false)}><div className="modal-campos"><label>Minutos<input type="number" min="0" value={minInput} onChange={(event) => setMinInput(event.target.value)} /></label><label>Segundos<input type="number" min="0" max="59" value={segInput} onChange={(event) => setSegInput(event.target.value)} /></label></div><div className="modal-botones"><button type="button" onClick={() => setEditarTiempo(false)}>Cancelar</button><button type="button" className="btn-primario" onClick={confirmarTiempo}>Aceptar</button></div></Modal>}
      {dialogoConfirmacion}
    </main>
  );
}

function ListaJugadores({ titulo, lista, jugadores, seleccionado, onSeleccionar, onMover, sancionesPorJugador }) {
  const enCampo = lista === "campo";
  return (
    <section className="lista-directo">
      {titulo && <h3>{titulo}</h3>}
      {jugadores.map((jugador) => {
        return (
          <div
            key={jugador.id}
            className={[
              "jugador-directo",
              jugador.posicion?.toLowerCase() === "portero" ? "jugador-directo--portero" : "",
              seleccionado === jugador.id ? "is-selected" : "",
            ].filter(Boolean).join(" ")}
          >
            <button type="button" className="jugador-directo__nombre" onClick={() => onSeleccionar(jugador.id)}>
              <strong>{jugador.dorsal}</strong>{jugador.nombre} {jugador.apellido}
            </button>
            <IconosSancion iconos={sancionesPorJugador[jugador.id]} />
            <button
              type="button"
              className="jugador-directo__mover"
              aria-label={enCampo ? "Mandar al banquillo" : "Sacar al campo"}
              title={enCampo ? "Mandar al banquillo" : "Sacar al campo"}
              onClick={() => onMover(jugador.id, lista)}
            >
              {enCampo ? "↓" : "↑"}
            </button>
          </div>
        );
      })}
      {jugadores.length === 0 && (
        <p className="lista-directo__vacia">{enCampo ? "Sube jugadores del banquillo con ↑." : "Sin jugadores en el banquillo."}</p>
      )}
    </section>
  );
}

// Acciones que cuentan como sanción en Directo: todas las de Sanciones
// (siempre de Agustinos) y los 2 min del rival, que se anotan en ataque.
function esSancion(accion) {
  return accion.at_def_san === "SAN" || esExclusionRival(accion);
}

// 2 min (nuestro o del rival), roja y azul paran el reloj; la amarilla no.
function paraElReloj(accion) {
  if (esExclusionRival(accion)) return true;
  return accion.at_def_san === "SAN" && ["2MIN", "ROJA", "AZUL"].includes(accion.fin);
}

const NOMBRE_SANCION = { "2MIN": "exclusión de 2 min", ROJA: "tarjeta roja", AZUL: "tarjeta azul" };

function mensajeRelojParado(accion, jugadorAlBanquillo, pendiente) {
  const motivo = esExclusionRival(accion) ? "exclusión de 2 min del rival" : NOMBRE_SANCION[accion.fin];
  let mensaje = `Tiempo parado: ${motivo}.`;
  if (jugadorAlBanquillo) mensaje += ` ${jugadorAlBanquillo.nombre} pasa al banquillo.`;
  if (accion.fin === "ROJA" || accion.fin === "AZUL") {
    mensaje += " Si el jugador queda excluido 2 min, añade también la exclusión.";
  }
  if (pendiente) mensaje += " (Sin conexión: se guardará cuando vuelva la red.)";
  return mensaje;
}

// Iconos de sanción de cada jugador en la lista lateral: solo los de la más
// grave que lleve. Azul > roja > exclusiones de 2 min (uno por cada una) >
// amarilla. Con una roja da igual en directo si antes tenía amarilla o 2 min.
function iconosSancionPorJugador(sanciones) {
  const porJugador = {};
  for (const accion of sanciones) {
    if (accion.at_def_san !== "SAN" || !accion.id_jugador) continue;
    (porJugador[accion.id_jugador] ||= []).push(accion.fin);
  }
  const iconos = {};
  for (const [idJugador, fines] of Object.entries(porJugador)) {
    if (fines.includes("AZUL")) iconos[idJugador] = ["AZUL"];
    else if (fines.includes("ROJA")) iconos[idJugador] = ["ROJA"];
    else if (fines.includes("2MIN")) iconos[idJugador] = fines.filter((fin) => fin === "2MIN");
    else if (fines.includes("AMARILLA")) iconos[idJugador] = ["AMARILLA"];
  }
  return iconos;
}

const COLOR_TARJETA = { AMARILLA: "amarillo", ROJA: "rojo", AZUL: "azul" };

function IconosSancion({ iconos }) {
  if (!iconos?.length) return null;
  return (
    <span className="jugador-directo__sanciones">
      {iconos.map((fin, indice) => (
        <IndicadorAccion key={indice} codigo="SAN" fin={fin} color={COLOR_TARJETA[fin]} />
      ))}
    </span>
  );
}

// Exclusiones en curso de un equipo, junto a su tipo de defensa: un ✌️ por
// cada una con lo que le queda. Va con el reloj de juego: si se para el
// reloj, la cuenta atrás también se para, como en el partido.
function ExclusionesEnCurso({ exclusiones }) {
  if (exclusiones.length === 0) return null;
  return (
    <span className="exclusiones-en-curso">
      {exclusiones.map(({ accion, restanteMs }, indice) => (
        <span key={accion.id_accion ?? `${accion.tiempo}-${indice}`} className="exclusiones-en-curso__item">
          <span aria-hidden="true">✌️</span>
          {formatearTiempo(Math.ceil(restanteMs / 1000) * 1000).replace(/^0/, "")}
        </span>
      ))}
    </span>
  );
}

function BotonesLanzamiento({ className, puedeGuardar, onGuardar }) {
  return (
    <div className={className}>
      {[["GOL", "Gol"], ["PAR", "Parada"], ["FUE", "Fuera"]].map(([valor, etiqueta]) => (
        <button key={valor} type="button" className={`acciones-lanzamiento__${valor.toLowerCase()}`} disabled={!puedeGuardar} onClick={() => onGuardar(valor)}>{etiqueta}</button>
      ))}
    </div>
  );
}

function SelectorCuadrantes({ clase, etiqueta, valor, onChange }) {
  return <div className={`selector-cuadrantes ${clase}`} role="group" aria-label={etiqueta}>{Array.from({ length: 9 }, (_, indice) => { const zona = indice + 1; return <button type="button" key={zona} className={valor === zona ? "is-selected" : ""} aria-label={`${etiqueta} ${zona}`} onClick={() => onChange(zona)}>{zona}</button>; })}</div>;
}

function SelectorZonasLanz({ valor, onChange }) {
  return <svg className="selector-zonas-lanz" viewBox="0 0 100 100" preserveAspectRatio="none" role="group" aria-label="Zona de lanzamiento">
    {ZONAS_LANZAMIENTO.map((puntos, indice) => {
      const zona = indice + 1;
      return <polygon key={zona} points={puntos} className={valor === zona ? "is-selected" : ""} onClick={() => onChange(zona)}><title>Zona de lanzamiento {zona}</title></polygon>;
    })}
  </svg>;
}
