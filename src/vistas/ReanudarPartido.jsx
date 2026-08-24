import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { leerPartidos } from "../datos/partidos.js";
import { obtenerEquipo } from "../datos/equipos";
import { useCargaAsync } from "../estado/useCargaAsync";
import BotonVolver from "../piezas/comun/BotonVolver";
import EstadoCarga from "../piezas/comun/EstadoCarga";
import "../estilos/PartidosGuardados.css";

// Mismo listado que "Ver partidos" (mismo orden por fecha/hora), pero cada
// ficha lleva directo al Directo del partido en vez de a sus estadísticas:
// es la puerta de entrada para retomar un partido tras cerrar la app a mitad.
export default function ReanudarPartido() {
  const navigate = useNavigate();
  const { equipoId } = useParams();
  const [equipo, setEquipo] = useState(null);
  const [partidos, setPartidos] = useState([]);

  const { cargando, error } = useCargaAsync(
    () => Promise.all([obtenerEquipo(equipoId), leerPartidos(Number(equipoId))]),
    {
      deps: [equipoId],
      onExito: ([equipoCargado, partidosCargados]) => {
        setEquipo(equipoCargado);
        setPartidos(partidosCargados);
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
            <Link className="ficha-partido ficha-partido--reanudar" key={partido.id} to={`/partidos/${partido.id}/directo`}>
              <strong>{equipo?.nombre || "Equipo"} vs {partido.rival}</strong>
              {partido.campo && <span className="campo-partido">{partido.campo}</span>}
              <time>{partido.fecha}</time>
              <time>{partido.hora}</time>
            </Link>
          ))}
        </EstadoCarga>
      </section>
    </main>
  );
}
