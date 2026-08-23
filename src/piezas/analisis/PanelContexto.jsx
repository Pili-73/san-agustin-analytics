import ResumenCifras from "./ResumenCifras";
import BarraSegmentada from "./BarraSegmentada";
import GrupoBarras from "./GrupoBarras";
import OtrasAcciones from "./OtrasAcciones";
import MapaEficacia from "./MapaEficacia";

// Columna completa de un contexto (ataque o defensa): cifras clave arriba,
// la barra general de lanzamientos/pérdidas/continuidades, las dos barras
// desplegables, el detalle exhaustivo, y el mapa de eficacia por zona al final.
export default function PanelContexto({
  variant,
  titulo,
  resumen,
  desgloseSituacion,
  desgloseFormacion,
  tituloFormacion,
  eficaciaZonas,
  eficaciaZonas7m,
}) {
  // El color de cada acción depende del código de contexto ("ATQ"/"DEF"),
  // no del nombre de columna ("ataque"/"defensa") que decide el color de la barra.
  const contexto = variant === "ataque" ? "ATQ" : "DEF";

  return (
    <section className={`panel-contexto panel-contexto--${variant}`}>
      <h2 className="panel-contexto__titulo">{titulo}</h2>
      <ResumenCifras resumen={resumen} />
      <BarraSegmentada
        segmentos={[
          { etiqueta: "lanzamientos", valor: resumen.lanzamientos, pct: resumen.pctLanzamientos, tono: "verde" },
          { etiqueta: "pérdidas", valor: resumen.cambiosPosesion, pct: resumen.pctCambiosPosesion, tono: "malo" },
          { etiqueta: "continuidades", valor: resumen.continuidades, pct: resumen.pctContinuidades, tono: "gris" },
        ]}
      />
      <GrupoBarras
        titulo="Situación ofensiva"
        datos={desgloseSituacion}
        variant={variant}
        eficaciaZonas7m={eficaciaZonas7m}
      />
      <GrupoBarras titulo={tituloFormacion} datos={desgloseFormacion} variant={variant} />
      <OtrasAcciones resumen={resumen} contexto={contexto} />
      <MapaEficacia
        titulo="Eficacia por zona"
        porZonaPorteria={eficaciaZonas.porZonaPorteria}
        porZonaLanz={eficaciaZonas.porZonaLanz}
        variant={variant}
      />
    </section>
  );
}
