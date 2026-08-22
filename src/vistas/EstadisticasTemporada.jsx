import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEstadisticasTemporada } from "../estado/useEstadisticasTemporada";
import { useCargaAsync } from "../estado/useCargaAsync";
import { obtenerEquipo } from "../datos/equipos";
import { listarJugadoresEquipo } from "../datos/jugadores";
import BotonVolver from "../piezas/comun/BotonVolver";
import EstadoCarga from "../piezas/comun/EstadoCarga";
import AvisoSinConexion from "../piezas/comun/AvisoSinConexion";
import PanelContexto from "../piezas/analisis/PanelContexto";
import FiltroFechas from "../piezas/analisis/FiltroFechas";
import "../estilos/Estadisticas.css";

async function cargarDatos(idEquipo) {
  const [equipo, jugadores] = await Promise.all([obtenerEquipo(idEquipo), listarJugadoresEquipo(idEquipo)]);
  return { equipo, jugadores };
}

// Una sola página para las estadísticas de temporada, de todo el equipo o de
// un jugador concreto: seleccionar un jugador solo recalcula las cifras de
// arriba, la cabecera y el filtro de fechas + lista de jugadores se quedan
// siempre en el mismo sitio (la lista, al final del todo).
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

      <EstadoCarga
        cargando={cargandoDatos || hoja.cargando}
        error={errorDatos || hoja.error}
        mensajeCargando="Cargando estadísticas de temporada…"
      >
        {hoja.partidos.length === 0 ? (
          <p className="estado-carga">Todavía no hay partidos registrados.</p>
        ) : (
          <>
            <div className="estadisticas__comparativa">
              <PanelContexto
                variant="ataque"
                titulo="ATAQUE"
                resumen={hoja.estadisticasAtaque}
                desgloseSituacion={hoja.desgloseSituacionAtaque}
                desgloseFormacion={hoja.desgloseFormacionAtaque}
                tituloFormacion="Defensa rival"
                eficaciaZonas={hoja.eficaciaZonasAtaque}
              />
              <PanelContexto
                variant="defensa"
                titulo="DEFENSA"
                resumen={hoja.estadisticasDefensa}
                desgloseSituacion={hoja.desgloseSituacionDefensa}
                desgloseFormacion={hoja.desgloseFormacionDefensa}
                tituloFormacion="Defensa propia"
                eficaciaZonas={hoja.eficaciaZonasDefensa}
              />
            </div>

            <div className="estadisticas__banda estadisticas__banda--sanciones">
              {jugadorIdNum != null ? "SANCIONES DEL JUGADOR" : "NUESTRAS SANCIONES"}
            </div>
            <div className="estadisticas__sanciones">
              <span><strong>{hoja.sanciones.exclusiones}</strong> exclusiones (2 min)</span>
              <span><strong>{hoja.sanciones.amarillas}</strong> amarillas</span>
              <span><strong>{hoja.sanciones.rojas}</strong> rojas</span>
              <span><strong>{hoja.sanciones.azules}</strong> azules</span>
            </div>

            <FiltroFechas
              rango={rango}
              onChange={setRango}
              fechaMin={hoja.rangoFechas[0]}
              fechaMax={hoja.rangoFechas[1]}
            />

            {datos.jugadores.length > 0 && (
              <>
                <div className="estadisticas__banda">POR JUGADOR</div>
                <nav className="jugadores-switch" aria-label="Filtrar estadísticas de temporada por jugador">
                  <Link
                    to={`/equipos/${idEquipo}/estadisticas`}
                    replace
                    className={`jugadores-switch__pill ${jugadorIdNum == null ? "is-selected" : ""}`}
                  >
                    Todo el equipo
                  </Link>
                  {datos.jugadores.map((jugador) => (
                    <Link
                      key={jugador.id}
                      to={`/equipos/${idEquipo}/estadisticas/jugador/${jugador.id}`}
                      replace
                      className={[
                        "jugadores-switch__pill",
                        jugador.id === jugadorIdNum ? "is-selected" : "",
                        jugador.posicion?.toLowerCase() === "portero" ? "jugadores-switch__pill--portero" : "",
                      ].filter(Boolean).join(" ")}
                    >
                      <strong>{jugador.dorsal}</strong> {jugador.apellido}
                    </Link>
                  ))}
                </nav>
              </>
            )}
          </>
        )}
      </EstadoCarga>
    </div>
  );
}
