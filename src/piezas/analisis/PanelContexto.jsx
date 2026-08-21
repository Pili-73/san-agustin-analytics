import ResumenCifras from "./ResumenCifras";
import GrupoBarras from "./GrupoBarras";
import OtrasAcciones from "./OtrasAcciones";

// Columna completa de un contexto (ataque o defensa): cifras clave arriba,
// luego las dos barras desplegables, y el detalle exhaustivo oculto al final.
export default function PanelContexto({ variant, titulo, resumen, desgloseSituacion, desgloseFormacion, tituloFormacion }) {
  return (
    <section className={`panel-contexto panel-contexto--${variant}`}>
      <h2 className="panel-contexto__titulo">{titulo}</h2>
      <ResumenCifras resumen={resumen} />
      <GrupoBarras titulo="Situación ofensiva" datos={desgloseSituacion} variant={variant} />
      <GrupoBarras titulo={tituloFormacion} datos={desgloseFormacion} variant={variant} />
      <OtrasAcciones resumen={resumen} />
    </section>
  );
}
