import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEstadisticasTemporada } from "../estado/useEstadisticasTemporada";
import { useCargaAsync } from "../estado/useCargaAsync";
import { obtenerEquipo } from "../datos/equipos";
import { listarJugadoresEquipo } from "../datos/jugadores";
import BotonVolver from "../piezas/comun/BotonVolver";
import EstadoCarga from "../piezas/comun/EstadoCarga";
import AvisoSinConexion from "../piezas/comun/AvisoSinConexion";
import SelectorJugadores from "../piezas/analisis/SelectorJugadores";
import PanelEquipo from "../piezas/analisis/PanelEquipo";
import PanelJugador from "../piezas/analisis/PanelJugador";
import FiltroFechas from "../piezas/analisis/FiltroFechas";
import "../estilos/Estadisticas.css";

async function cargarDatos(idEquipo) {
  const [equipo, jugadores] = await Promise.all([obtenerEquipo(idEquipo), listarJugadoresEquipo(idEquipo)]);
  return { equipo, jugadores };
}

// Una sola página para las estadísticas de temporada, de todo el equipo o de
// un jugador concreto: sin jugador seleccionado se ve la misma vista que
// Estadísticas generales; con uno seleccionado, exactamente la misma vista
// que Estadísticas por jugador. Tocar la píldora ya seleccionada deselecciona.
export default function EstadisticasTemporada() {
  const navigate = useNavigate();
  const { equipoId, jugadorId } = useParams();
  const idEquipo = Number(equipoId);
  const jugadorIdNum = jugadorId ? Number(jugadorId) : null;

  const [datos, setDatos] = useState({ equipo: null, jugadores: [] });
  const { cargando: cargandoDatos, error: errorDatos } = useCargaAsync(() => cargarDatos(idEquipo), {
    deps: [idEquipo],
    onExito: setDatos,
    mensajeError: "Error cargando el equipo",
  });

  const [rango, setRango] = useState(null);
  const hoja = useEstadisticasTemporada(idEquipo, jugadorIdNum, rango);

  const jugadorSeleccionado = datos.jugadores.find((jugador) => jugador.id === jugadorIdNum);
  const esPortero = jugadorSeleccionado?.posicion?.toLowerCase() === "portero";

  return (
    <div className="estadisticas">
      <header className="estadisticas__cabecera">
        <BotonVolver onClick={() => navigate(-1)} />
        <h1 className="estadisticas__titulo">
          {jugadorIdNum != null
            ? jugadorSeleccionado
              ? `${jugadorSeleccionado.dorsal} · ${jugadorSeleccionado.nombre} ${jugadorSeleccionado.apellido}`
              : "Jugador"
            : `${datos.equipo?.nombre || "Equipo"} · Temporada${datos.equipo?.temporada ? ` ${datos.equipo.temporada}` : ""}`}
        </h1>
      </header>

      <AvisoSinConexion />

      {datos.jugadores.length > 0 && (
        <div className="temporada-selector-jugadores">
          <SelectorJugadores
            jugadores={datos.jugadores}
            seleccionadoId={jugadorIdNum}
            enlaceTodos={`/equipos/${idEquipo}/estadisticas`}
            // Tocar la píldora ya seleccionada deselecciona y vuelve al equipo.
            enlaceJugador={(jugador) =>
              jugador.id === jugadorIdNum
                ? `/equipos/${idEquipo}/estadisticas`
                : `/equipos/${idEquipo}/estadisticas/jugador/${jugador.id}`
            }
            aria="Filtrar estadísticas de temporada por jugador"
          />
        </div>
      )}

      <EstadoCarga
        cargando={cargandoDatos || hoja.cargando}
        error={errorDatos || hoja.error}
        mensajeCargando="Cargando estadísticas de temporada…"
      >
        {hoja.partidos.length === 0 ? (
          <p className="estado-carga">Todavía no hay partidos registrados.</p>
        ) : jugadorIdNum != null ? (
          <PanelJugador stats={hoja} esPortero={esPortero} tituloSanciones="SANCIONES DEL JUGADOR" />
        ) : (
          <PanelEquipo hoja={hoja} tituloSanciones="NUESTRAS SANCIONES" />
        )}

        {hoja.partidos.length > 0 && (
          <FiltroFechas rango={rango} onChange={setRango} fechaMin={hoja.rangoFechas[0]} fechaMax={hoja.rangoFechas[1]} />
        )}
      </EstadoCarga>
    </div>
  );
}
