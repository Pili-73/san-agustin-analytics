import PanelContexto from "./PanelContexto";
import BandaSanciones from "./BandaSanciones";

// Vista "generales": comparativa ataque/defensa de todo el equipo + sanciones.
// La usan tanto la pantalla de un partido como la de temporada sin jugador
// seleccionado.
export default function PanelEquipo({ hoja, tituloSanciones }) {
  return (
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
          eficaciaZonas7m={hoja.eficaciaZonas7mAtaque}
        />
        <PanelContexto
          variant="defensa"
          titulo="DEFENSA"
          resumen={hoja.estadisticasDefensa}
          desgloseSituacion={hoja.desgloseSituacionDefensa}
          desgloseFormacion={hoja.desgloseFormacionDefensa}
          tituloFormacion="Defensa propia"
          eficaciaZonas={hoja.eficaciaZonasDefensa}
          eficaciaZonas7m={hoja.eficaciaZonas7mDefensa}
        />
      </div>
      <BandaSanciones titulo={tituloSanciones} sanciones={hoja.sanciones} />
    </>
  );
}
