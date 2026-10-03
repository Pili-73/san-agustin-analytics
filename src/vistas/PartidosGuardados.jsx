import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { leerPartidos } from "../datos/partidos.js";
import { obtenerEquipo } from "../datos/equipos";
import { marcadoresPartidos } from "../datos/acciones";
import { useCargaAsync } from "../estado/useCargaAsync";
import BotonVolver from "../piezas/comun/BotonVolver";
import EstadoCarga from "../piezas/comun/EstadoCarga";
import "../estilos/PartidosGuardados.css";

export default function PartidosGuardados() {
  const navigate = useNavigate();
  const { equipoId } = useParams();
  const [equipo, setEquipo] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [marcadores, setMarcadores] = useState(new Map());

  const { cargando, error } = useCargaAsync(
    async () => {
      const [equipoCargado, partidosCargados] = await Promise.all([obtenerEquipo(equipoId), leerPartidos(Number(equipoId))]);
      // El marcador es un extra: si no se pueden leer las acciones, la lista
      // de partidos se muestra igual, solo que sin resultado.
      const marcadoresCargados = await marcadoresPartidos(partidosCargados.map((partido) => partido.id)).catch(() => new Map());
      return [equipoCargado, partidosCargados, marcadoresCargados];
    },
    {
      deps: [equipoId],
      onExito: ([equipoCargado, partidosCargados, marcadoresCargados]) => {
        setEquipo(equipoCargado);
        setPartidos(partidosCargados);
        setMarcadores(marcadoresCargados);
      },
      mensajeError: "No se pudieron cargar los partidos.",
    }
  );

  return (
    <main className="vista-partidos">
      <header className="cabecera-partidos">
        <BotonVolver onClick={() => navigate(-1)} />
        <h1 className="partidos-guardados__titulo">{equipo?.nombre || "Partidos"}</h1>
      </header>

      <section className="lista-partidos" aria-live="polite">
        <EstadoCarga cargando={cargando} error={error} mensajeCargando="Cargando partidos…">
          {partidos.length === 0 && <p className="estado-carga">No hay partidos registrados.</p>}
          {partidos.map((partido) => (
            <article className="ficha-partido" key={partido.id}>
              <strong>{equipo?.nombre || "Equipo"} vs {partido.rival}</strong>
              {partido.campo && <span className="campo-partido">{partido.campo}</span>}
              {marcadores.has(partido.id) && (
                <span className="marcador-partido">
                  {marcadores.get(partido.id).favor} - {marcadores.get(partido.id).contra}
                </span>
              )}
              <time>{partido.fecha}</time>
              <time>{partido.hora}</time>
              <div className="ficha-partido__botones">
                <Link
                  className="ficha-partido__boton"
                  to={`/partidos/${partido.id}/estadisticas`}
                  state={{ equipo: equipo?.nombre, rival: partido.rival }}
                >
                  Estadísticas generales
                </Link>
                <Link
                  className="ficha-partido__boton ficha-partido__boton--jugador"
                  to={`/partidos/${partido.id}/estadisticas/jugador`}
                  state={{ equipo: equipo?.nombre, rival: partido.rival }}
                >
                  Estadísticas por jugador
                </Link>
              </div>
            </article>
          ))}
        </EstadoCarga>
      </section>
    </main>
  );
}
