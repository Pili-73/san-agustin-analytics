import ResumenCifras from "./ResumenCifras";
import GrupoBarras from "./GrupoBarras";
import OtrasAcciones from "./OtrasAcciones";
import MapaEficacia from "./MapaEficacia";

// Columna completa de un contexto (ataque o defensa): cifras clave arriba,
// luego las dos barras desplegables, el detalle exhaustivo, y el mapa de
// eficacia por zona al final.
export default function PanelContexto({
  variant,
  titulo,
  resumen,
  desgloseSituacion,
  desgloseFormacion,
  tituloFormacion,
  eficaciaZonas,
}) {
  return (
    <section className={`panel-contexto panel-contexto--${variant}`}>
      <h2 className="panel-contexto__titulo">{titulo}</h2>
      <ResumenCifras resumen={resumen} />
      <GrupoBarras titulo="Situación ofensiva" datos={desgloseSituacion} variant={variant} />
      <GrupoBarras titulo={tituloFormacion} datos={desgloseFormacion} variant={variant} />
      <OtrasAcciones resumen={resumen} />
      <MapaEficacia
        titulo="Eficacia por zona"
        porZonaPorteria={eficaciaZonas.porZonaPorteria}
        porZonaLanz={eficaciaZonas.porZonaLanz}
        variant={variant}
      />
    </section>
  );
}
