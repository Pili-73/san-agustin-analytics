import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useHojaEstadisticas } from "../estado/useHojaEstadisticas";
import { useCargaAsync } from "../estado/useCargaAsync";
import { obtenerPartido } from "../datos/partidos";
import { obtenerEquipo } from "../datos/equipos";
import { listarJugadoresEquipo } from "../datos/jugadores";
import BotonVolver from "../piezas/comun/BotonVolver";
import EstadoCarga from "../piezas/comun/EstadoCarga";
import AvisoSinConexion from "../piezas/comun/AvisoSinConexion";
import SelectorJugadores from "../piezas/analisis/SelectorJugadores";
import PanelJugador from "../piezas/analisis/PanelJugador";
import FiltroTiempo from "../piezas/analisis/FiltroTiempo";
import "../estilos/Estadisticas.css";

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
  const stats = useHojaEstadisticas(partidoId, jugadorIdNum, rango);

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
            <SelectorJugadores
              jugadores={datos.jugadores}
              seleccionadoId={jugadorIdNum}
              enlaceJugador={(j) => `/partidos/${partidoId}/estadisticas/jugador/${j.id}`}
              state={location.state}
              aria="Cambiar de jugador"
            />
          )}

          <EstadoCarga
            cargando={cargandoDatos || stats.cargando || jugadorIdNum == null}
            error={errorDatos || stats.error}
            mensajeCargando="Cargando estadísticas…"
          >
            <PanelJugador stats={stats} esPortero={esPortero} tituloSanciones="SANCIONES DEL JUGADOR" />
            <FiltroTiempo rango={rango} onChange={setRango} maxMinutos={stats.maxMinutos} />
          </EstadoCarga>
        </>
      )}
    </div>
  );
}
