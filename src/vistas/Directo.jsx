import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerEquipo } from "../datos/equipos";
import { listarJugadoresEquipo } from "../datos/jugadores";
import { obtenerPartido } from "../datos/partidos";
import { usePartidoEnDirecto } from "../estado/usePartidoEnDirecto";
import { useArrastrePlantilla } from "../estado/useArrastrePlantilla";
import { formatearTiempo } from "../utils/tiempo";
import { borrarEstadoDirecto, guardarEstadoDirecto, leerEstadoDirecto } from "../utils/estadoDirecto";
import { ZONAS_LANZAMIENTO } from "../utils/zonasCampo";
import BarraMarcador from "../piezas/partido/BarraMarcador";
import Modal from "../piezas/comun/Modal";
import Toast from "../piezas/comun/Toast";
import "../estilos/Directo.css";

const SITUACIONES = [
  { valor: "CGOL", texto: "Contragol", imagen: "/contragol.jpg" },
  { valor: "1OL", texto: "1ª oleada", imagen: "/1_oleada.jpg" },
  { valor: "2OL", texto: "2ª oleada", imagen: "/2_oleada.jpg" },
  { valor: "POS", texto: "Posicional", imagen: "/posicional.jpg" },
  { valor: "7M", texto: "7 m", imagen: "/7m.jpg" },
];

const OPCIONES_ACCION = [
  {
    codigo: "ATQ",
    titulo: "Ataque",
    opciones: [
      ["INF", "Infracción"], ["FAT", "F. ataque"], ["PER", "Pérdida"],
      ["FAL", "Falta"], ["BLQ", "Bloqueo"], ["1V1", "1v1"],
      ["2V2", "2v2"], ["2MIN", "2 min"], ["7M", "7 m"],
    ],
  },
  {
    codigo: "DEF",
    titulo: "Defensa",
    opciones: [
      ["1V1", "1v1"], ["2V2", "2v2"], ["7M", "7 m"],
      ["FAL", "Falta"],
      ["BLQ", "Bloqueo"], ["INF", "Infracción"], ["FAT", "F. ataque"], ["INT", "Intercepción"],
    ],
  },
  {
    codigo: "SAN",
    titulo: "Sanciones",
    opciones: [["2MIN", "2 min"], ["AMARILLA", "Amarilla"], ["ROJA", "Roja"], ["AZUL", "Azul"]],
  },
];

const TIPOS_DEFENSA = ["6:0", "5:1", "3:3", "3:2:1"];

function colorOpcion(codigo, fin) {
  if (codigo === "SAN") {
    return { "2MIN": "gris", AMARILLA: "amarillo", ROJA: "rojo", AZUL: "azul" }[fin];
  }
  if (codigo === "DEF") {
    if (["1V1", "2V2", "7M"].includes(fin)) return "rojo";
    if (["INF", "FAT", "INT"].includes(fin)) return "verde";
    if (["FAL", "BLQ"].includes(fin)) return "blanco";
    return "malo";
  }
  if (["FAL", "BLQ"].includes(fin)) return "blanco";
  if (["1V1", "2V2", "2MIN", "7M"].includes(fin)) return "verde";
  return "malo";
}

// Icono de cada opción: las sanciones usan el gesto de 2 dedos (2 min) o una
// tarjeta (amarilla/roja/azul); el resto, un círculo de color.
function IndicadorOpcion({ codigo, fin }) {
  if (codigo === "SAN" && fin === "2MIN") {
    return <span className="icono-2min" aria-hidden="true">✌️</span>;
  }
  if (codigo === "SAN") {
    return <span className={`icono-tarjeta icono-tarjeta--${colorOpcion(codigo, fin)}`} aria-hidden="true" />;
  }
  return <span className={`indicador-color indicador-color--${colorOpcion(codigo, fin)}`} aria-hidden="true" />;
}

export default function Directo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const partidoId = Number(id);
  const partidoEnDirecto = usePartidoEnDirecto(partidoId);
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

  useEffect(() => {
    let activo = true;
    Promise.resolve().then(async () => {
      const partidoCargado = await obtenerPartido(partidoId);
      const [equipoCargado, jugadoresCargados] = await Promise.all([
        obtenerEquipo(partidoCargado.id_equipo),
        listarJugadoresEquipo(partidoCargado.id_equipo),
      ]);
      if (!activo) return;
      setPartido(partidoCargado);
      setEquipo(equipoCargado);
      setJugadores(jugadoresCargados);

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
        partidoEnDirecto.restaurarElapsedMs(guardado.elapsedMs);
        partidoEnDirecto.restaurarMarcador(guardado.golesAgustinos, guardado.golesRival);
        setParte(guardado.parte || 1);
      } else {
        setCampoIds(jugadoresCargados.slice(0, 7).map((jugador) => jugador.id));
        setBanquilloIds(jugadoresCargados.slice(7).map((jugador) => jugador.id));
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
  const jugadorSeleccionado = jugadores.find((jugador) => jugador.id === seleccionado);
  const esPorteroSeleccionado = jugadorSeleccionado?.posicion?.toLowerCase() === "portero";
  const puedeGuardarLanzamiento = !!jugadorSeleccionado && !!zonaLanz && !!zonaPorteria && !partidoEnDirecto.guardando;
  const totalPendientes = partidoEnDirecto.pendientes.length + partidoEnDirecto.pendientesBorrado;

  // Cambiar de jugador cierra cualquier desplegable de ataque/defensa/sanción
  // que hubiera quedado abierto: sus opciones son para el jugador anterior.
  const seleccionarJugador = (id) => {
    setSeleccionado(id);
    setGrupoAbierto(null);
  };

  const { arrastre, zonaSobrevolada, empezarArrastre, seguirArrastre, soltarArrastre } = useArrastrePlantilla({
    campo: campoIds,
    banquillo: banquilloIds,
    setCampo: setCampoIds,
    setBanquillo: setBanquilloIds,
  });

  const tipoDefPara = (codigo) => {
    if (codigo === "ATQ") return tipoDefRival;
    if (codigo === "DEF") return tipoDefPropio;
    return null;
  };

  const guardarEvento = async (codigo, fin) => {
    if (!jugadorSeleccionado) {
      partidoEnDirecto.limpiarAviso();
      return;
    }
    const guardada = await partidoEnDirecto.guardarAccion({
      id_jugador: jugadorSeleccionado.id,
      at_def_san: codigo,
      fin,
      sit_ofensiva: situacion,
      tipo_def: tipoDefPara(codigo),
    });
    if (guardada) {
      setSituacion("POS");
      if (fin === "2MIN") partidoEnDirecto.pausarCronometro();
    }
    setGrupoAbierto(null);
  };

  const guardarLanzamiento = async (resultado) => {
    if (!jugadorSeleccionado || !zonaLanz || !zonaPorteria) return;
    const esPortero = jugadorSeleccionado.posicion?.toLowerCase() === "portero";
    const tipoAccion = esPortero ? "DEF" : "ATQ";
    const guardada = await partidoEnDirecto.guardarAccion({
      id_jugador: jugadorSeleccionado.id,
      at_def_san: tipoAccion,
      sit_ofensiva: situacion,
      tipo_def: tipoDefPara(tipoAccion),
      zona_lanz: zonaLanz,
      zona_porteria: zonaPorteria,
      gol_parada_fuera: resultado,
    });
    if (guardada) {
      setZonaLanz(null);
      setZonaPorteria(null);
      setSituacion("POS");
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
  const finalizarPrimerTiempo = () => {
    if (!window.confirm("¿Finalizar el primer tiempo?")) return;
    partidoEnDirecto.pausarCronometro();
    partidoEnDirecto.establecerTiempoManual(30, 0);
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
      golesAgustinos: partidoEnDirecto.marcador.golesAgustinos,
      golesRival: partidoEnDirecto.marcador.golesRival,
      tipoDefPropio,
      tipoDefRival,
      campoIds,
      banquilloIds,
      parte,
    });
    navigate(ruta);
  };

  const finalizarPartido = () => {
    const avisoPendientes = totalPendientes
      ? `\n\nOjo: quedan ${totalPendientes} cambios sin subir (sin conexión). Se guardarán solos en cuanto vuelva la red; hasta entonces solo se ven en Estadísticas desde este mismo dispositivo.`
      : "";
    if (window.confirm(`¿Estás seguro de acabar el partido?${avisoPendientes}`)) {
      partidoEnDirecto.pausarCronometro();
      borrarEstadoDirecto(partidoId);
      navigate(`/equipos/${partido?.id_equipo}/partidos`);
    }
  };

  return (
    <main className="partido-directo">
      <Toast
        key={partidoEnDirecto.avisoId}
        mensaje={partidoEnDirecto.aviso}
        tipo={partidoEnDirecto.avisoTipo}
        onDismiss={partidoEnDirecto.limpiarAviso}
      />
      <BarraMarcador
        equipo={equipo?.nombre}
        rival={partido?.rival}
        marcador={partidoEnDirecto.marcador}
        tiempo={formatearTiempo(partidoEnDirecto.elapsedMs)}
        tiempoMuerto={tiempoMuerto}
        parte={parte}
        onAbrirMenu={() => setMenuMarcador(true)}
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
            onEmpezarArrastre={empezarArrastre}
            onSeguirArrastre={seguirArrastre}
            onSoltarArrastre={soltarArrastre}
            arrastrandoId={arrastre?.id}
            sobrevolada={zonaSobrevolada}
          />
          <div className="plantilla-directo__separador">BANQUILLO</div>
          <ListaJugadores
            titulo=""
            lista="banquillo"
            jugadores={jugadoresBanquillo}
            seleccionado={seleccionado}
            onSeleccionar={seleccionarJugador}
            onEmpezarArrastre={empezarArrastre}
            onSeguirArrastre={seguirArrastre}
            onSoltarArrastre={soltarArrastre}
            arrastrandoId={arrastre?.id}
            sobrevolada={zonaSobrevolada}
          />
        </aside>

        <section className="panel-directo">
          <div className="tipos-defensa">
            <label className="tipos-defensa__pill tipos-defensa__pill--propia">
              D. propia
              <select value={tipoDefPropio} onChange={(event) => setTipoDefPropio(event.target.value)}>
                {TIPOS_DEFENSA.map((tipo) => <option key={tipo}>{tipo}</option>)}
              </select>
            </label>
            <label className="tipos-defensa__pill tipos-defensa__pill--rival">
              D. rival
              <select value={tipoDefRival} onChange={(event) => setTipoDefRival(event.target.value)}>
                {TIPOS_DEFENSA.map((tipo) => <option key={tipo}>{tipo}</option>)}
              </select>
            </label>
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
              <p>{jugadorSeleccionado ? `Jugador: ${jugadorSeleccionado.nombre} ${jugadorSeleccionado.apellido}` : "Selecciona un jugador para anotar acciones"}</p>
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
                    onClick={partidoEnDirecto.deshacerUltimaAccion}
                    disabled={partidoEnDirecto.guardando}
                  >
                    ↩ Deshacer
                  </button>
                )}
              </div>
            </div>
            <div className="acciones-jugador__grupos">
              {OPCIONES_ACCION.map((grupo) => (
                <div className={`grupo-accion grupo-accion--${grupo.codigo.toLowerCase()}`} key={grupo.codigo}>
                  <button type="button" className="grupo-accion__cabecera" onClick={() => setGrupoAbierto((actual) => actual === grupo.codigo ? null : grupo.codigo)} disabled={!jugadorSeleccionado}>
                    {grupo.titulo}
                    <span className="grupo-accion__flecha" aria-hidden="true">{grupoAbierto === grupo.codigo ? "▲" : "▼"}</span>
                  </button>
                  {grupoAbierto === grupo.codigo && <div className="grupo-accion__opciones">
                    {grupo.opciones.map(([fin, texto]) => <button type="button" key={`${grupo.codigo}-${fin}`} onClick={() => guardarEvento(grupo.codigo, fin)} disabled={partidoEnDirecto.guardando}><IndicadorOpcion codigo={grupo.codigo} fin={fin} /><span className="grupo-accion__texto">{texto}</span></button>)}
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
    </main>
  );
}

function ListaJugadores({ titulo, lista, jugadores, seleccionado, onSeleccionar, onEmpezarArrastre, onSeguirArrastre, onSoltarArrastre, arrastrandoId, sobrevolada }) {
  const sobrevolandoFinal = sobrevolada?.lista === lista && sobrevolada?.targetId == null;
  return (
    <section className="lista-directo" data-lista={lista}>
      {titulo && <h3>{titulo}</h3>}
      {jugadores.map((jugador) => {
        const marcaAntes = sobrevolada?.lista === lista && sobrevolada?.targetId === jugador.id && sobrevolada?.before;
        const marcaDespues = sobrevolada?.lista === lista && sobrevolada?.targetId === jugador.id && !sobrevolada?.before;
        return (
          <div
            key={jugador.id}
            data-jugador-fila={jugador.id}
            className={[
              "jugador-directo",
              jugador.posicion?.toLowerCase() === "portero" ? "jugador-directo--portero" : "",
              seleccionado === jugador.id ? "is-selected" : "",
              arrastrandoId === jugador.id ? "is-arrastrando" : "",
              marcaAntes ? "drop-antes" : "",
              marcaDespues ? "drop-despues" : "",
            ].filter(Boolean).join(" ")}
          >
            <button type="button" className="jugador-directo__nombre" onClick={() => onSeleccionar(jugador.id)}>
              <strong>{jugador.dorsal}</strong>{jugador.nombre} {jugador.apellido}
            </button>
            <button
              type="button"
              className="jugador-directo__asa"
              aria-label="Arrastrar para mover de lista"
              onPointerDown={(event) => onEmpezarArrastre(event, jugador.id, lista)}
              onPointerMove={onSeguirArrastre}
              onPointerUp={onSoltarArrastre}
              onPointerCancel={onSoltarArrastre}
            >
              ⠿
            </button>
          </div>
        );
      })}
      {jugadores.length === 0 && <p className="lista-directo__vacia">Suelta aquí un jugador.</p>}
      <div className={`lista-directo__final ${sobrevolandoFinal ? "drop-al-final" : ""}`} />
    </section>
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
