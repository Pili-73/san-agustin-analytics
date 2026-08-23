import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useHojaEstadisticas } from "../estado/useHojaEstadisticas";
import { useCargaAsync } from "../estado/useCargaAsync";
import { obtenerPartido } from "../datos/partidos";
import { obtenerEquipo } from "../datos/equipos";
import BotonVolver from "../piezas/comun/BotonVolver";
import EstadoCarga from "../piezas/comun/EstadoCarga";
import AvisoSinConexion from "../piezas/comun/AvisoSinConexion";
import PanelEquipo from "../piezas/analisis/PanelEquipo";
import FiltroTiempo from "../piezas/analisis/FiltroTiempo";
import "../estilos/Estadisticas.css";

async function cargarCabecera(partidoId) {
  const partido = await obtenerPartido(partidoId);
  const equipo = await obtenerEquipo(partido.id_equipo);
  return { equipoNombre: equipo.nombre, rival: partido.rival };
}

export default function Estadisticas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const partidoId = Number(id);

  // Mientras carga, usamos lo que venga por state (si viene de Directo o de
  // PartidosGuardados) para no mostrar "Equipo vs Rival" un instante.
  const [cabecera, setCabecera] = useState({
    equipoNombre: location.state?.equipo || null,
    rival: location.state?.rival || null,
  });

  // Solo actualiza el título; si falla, se queda con el valor de location.state.
  useCargaAsync(() => cargarCabecera(partidoId), {
    deps: [partidoId],
    onExito: setCabecera,
    mensajeError: "Error cargando el partido",
  });

  const [rango, setRango] = useState(null);
  const hoja = useHojaEstadisticas(partidoId, null, rango);

  return (
    <div className="estadisticas">
      <header className="estadisticas__cabecera">
        <BotonVolver onClick={() => navigate(-1)} />
        <h1 className="estadisticas__titulo">
          {cabecera.equipoNombre || "Equipo"} vs {cabecera.rival || "Rival"}
        </h1>
      </header>

      <AvisoSinConexion />

      <EstadoCarga cargando={hoja.cargando} error={hoja.error} mensajeCargando="Cargando estadísticas…">
        <PanelEquipo hoja={hoja} tituloSanciones="NUESTRAS SANCIONES" />
        <FiltroTiempo rango={rango} onChange={setRango} maxMinutos={hoja.maxMinutos} />
      </EstadoCarga>
    </div>
  );
}
