import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEstadisticasJugador } from "../estado/useEstadisticasJugador";
import { useCargaAsync } from "../estado/useCargaAsync";
import { obtenerPartido } from "../datos/partidos";
import { obtenerEquipo } from "../datos/equipos";
import { listarJugadoresEquipo } from "../datos/jugadores";
import BotonVolver from "../piezas/comun/BotonVolver";
import EstadoCarga from "../piezas/comun/EstadoCarga";
import AvisoSinConexion from "../piezas/comun/AvisoSinConexion";
import ResumenCifras from "../piezas/analisis/ResumenCifras";
import FiltroTiempo from "../piezas/analisis/FiltroTiempo";
import MapaEficacia from "../piezas/analisis/MapaEficacia";
import "../estilos/Estadisticas.css";

const FILAS_ACCIONES = [
  { clave: "perdidas", titulo: "Pérdidas" },
  { clave: "infracciones", titulo: "Infracciones" },
  { clave: "faltasAtaque", titulo: "Faltas de ataque" },
  { clave: "faltasRecibidas", titulo: "Faltas recibidas" },
  { clave: "bloqueos", titulo: "Bloqueos" },
  { clave: "intercepciones", titulo: "Intercepciones" },
  { clave: "unoVsUno", titulo: "1 vs 1" },
  { clave: "dosVsDos", titulo: "2 vs 2" },
  { clave: "penaltis", titulo: "7 m" },
  { clave: "exclusiones", titulo: "Exclusiones" },
];

async function cargarDatos(partidoId) {
  const partido = await obtenerPartido(partidoId);
  const [equipo, jugadores] = await Promise.all([
    obtenerEquipo(partido.id_equipo),
    listarJugadoresEquipo(partido.id_equipo),
  ]);
  return { equipoNombre: equipo.nombre, rival: partido.rival, jugadores };
}

export default function EstadisticasJugador() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, jugadorId } = useParams();
  const partidoId = Number(id);
  const jugadorIdNum = jugadorId ? Number(jugadorId) : null;

  const [datos, setDatos] = useState({
    equipoNombre: location.state?.equipo || null,
    rival: location.state?.rival || null,
    jugadores: [],
  });

  const { cargando: cargandoDatos, error: errorDatos } = useCargaAsync(() => cargarDatos(partidoId), {
    deps: [partidoId],
    onExito: setDatos,
    mensajeError: "Error cargando el partido",
  });

  // Entrada sin jugador concreto (desde PartidosGuardados o Directo): en
  // cuanto llega la plantilla, redirige al primero para tener una URL
  // canónica desde la que el selector pueda cambiar de jugador.
  useEffect(() => {
    if (jugadorIdNum == null && datos.jugadores.length > 0) {
      navigate(`/partidos/${partidoId}/estadisticas/jugador/${datos.jugadores[0].id}`, {
        replace: true,
        state: location.state,
      });
    }
  }, [jugadorIdNum, datos.jugadores, partidoId, navigate, location.state]);

  const jugador = datos.jugadores.find((j) => j.id === jugadorIdNum);
  const esPortero = jugador?.posicion?.toLowerCase() === "portero";

  const [rango, setRango] = useState(null);
  const stats = useEstadisticasJugador(partidoId, jugadorIdNum, rango);
  const statsLanzamientos = esPortero ? stats.estadisticasDefensa : stats.estadisticasAtaque;
  const eficaciaZonas = esPortero ? stats.eficaciaZonasDefensa : stats.eficaciaZonasAtaque;

  return (
    <div className="estadisticas">
      <header className="estadisticas__cabecera">
        <BotonVolver onClick={() => navigate(-1)} />
        <h1 className="estadisticas__titulo">
          {jugador ? `${jugador.dorsal} · ${jugador.nombre} ${jugador.apellido}` : "Jugador"}
        </h1>
      </header>

      <AvisoSinConexion />

      {!cargandoDatos && !errorDatos && datos.jugadores.length === 0 ? (
        <p className="estado-carga">No hay jugadores en la plantilla.</p>
      ) : (
        <>
          {datos.jugadores.length > 0 && (
            <nav className="jugadores-switch" aria-label="Cambiar de jugador">
              {datos.jugadores.map((j) => (
                <Link
                  key={j.id}
                  to={`/partidos/${partidoId}/estadisticas/jugador/${j.id}`}
                  state={location.state}
                  replace
                  className={[
                    "jugadores-switch__pill",
                    j.id === jugadorIdNum ? "is-selected" : "",
                    j.posicion?.toLowerCase() === "portero" ? "jugadores-switch__pill--portero" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <strong>{j.dorsal}</strong> {j.apellido}
                </Link>
              ))}
            </nav>
          )}

          <EstadoCarga
            cargando={cargandoDatos || stats.cargando || jugadorIdNum == null}
            error={errorDatos || stats.error}
            mensajeCargando="Cargando estadísticas…"
          >
            {esPortero && (
              <>
                <div className="estadisticas__banda">
                  PORTERÍA · {stats.estadisticasDefensa.pctParadas}% de eficacia
                </div>
                <ResumenCifras
                  resumen={stats.estadisticasDefensa}
                  titulos={["Recibidos", "Goles encajados", "Paradas", "Fueras"]}
                />
              </>
            )}

            {!esPortero && (
              <>
                <div className="estadisticas__banda">LANZAMIENTOS</div>
                <ResumenCifras resumen={statsLanzamientos} />
              </>
            )}

            <MapaEficacia
              titulo={esPortero ? "Lanzamientos recibidos por zona" : "Eficacia por zona"}
              porZonaPorteria={eficaciaZonas.porZonaPorteria}
              porZonaLanz={eficaciaZonas.porZonaLanz}
              variant={esPortero ? "defensa" : "ataque"}
            />

            <div className="estadisticas__banda">TODAS LAS ACCIONES</div>
            <div className="otras-acciones__grid">
              {FILAS_ACCIONES.map((fila) => (
                <div className="otras-acciones__item" key={fila.clave}>
                  <strong>{stats.todasLasAcciones[fila.clave]}</strong> {fila.titulo}
                </div>
              ))}
            </div>

            <div className="estadisticas__banda estadisticas__banda--sanciones">SANCIONES DEL JUGADOR</div>
            <div className="estadisticas__sanciones">
              <span><strong>{stats.sanciones.exclusiones}</strong> exclusiones (2 min)</span>
              <span><strong>{stats.sanciones.amarillas}</strong> amarillas</span>
              <span><strong>{stats.sanciones.rojas}</strong> rojas</span>
              <span><strong>{stats.sanciones.azules}</strong> azules</span>
            </div>

            <FiltroTiempo rango={rango} onChange={setRango} maxMinutos={stats.maxMinutos} />
          </EstadoCarga>
        </>
      )}
    </div>
  );
}
