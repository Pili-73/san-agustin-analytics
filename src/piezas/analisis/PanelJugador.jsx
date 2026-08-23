import { useRef, useState } from "react";
import ResumenCifras from "./ResumenCifras";
import MapaEficacia from "./MapaEficacia";
import ListaAcciones from "./ListaAcciones";
import BandaSanciones from "./BandaSanciones";

// Vista "por jugador": resumen de lanzamientos, carrusel de mapas de zona
// (todos los lanzamientos / solo 7 m), todas las acciones por contexto, y
// sanciones. La usan tanto la pantalla de un partido como la de temporada
// con un jugador seleccionado — stats es siempre una "hoja" de
// calcularHojaCompleta, ya acotada a ese jugador.
export default function PanelJugador({ stats, esPortero, tituloSanciones }) {
  const variant = esPortero ? "defensa" : "ataque";
  const resumenLanz = esPortero ? stats.estadisticasDefensa : stats.estadisticasAtaque;
  const eficaciaZonas = esPortero ? stats.eficaciaZonasDefensa : stats.eficaciaZonasAtaque;
  const eficaciaZonas7m = esPortero ? stats.eficaciaZonas7mDefensa : stats.eficaciaZonas7mAtaque;
  const tituloZonas = esPortero ? "LANZAMIENTOS RECIBIDOS POR ZONA" : "EFICACIA POR ZONA";
  const tituloZonas7m = esPortero ? "7 M RECIBIDOS POR ZONA" : "EFICACIA DE 7 M";

  const pistaRef = useRef(null);
  const [panelActivo, setPanelActivo] = useState(0);

  const manejarScroll = (evento) => {
    const el = evento.currentTarget;
    setPanelActivo(Math.round(el.scrollLeft / el.clientWidth));
  };

  const irAPanel = (indice) => {
    pistaRef.current?.scrollTo({ left: indice * pistaRef.current.clientWidth, behavior: "smooth" });
  };

  return (
    <>
      {esPortero ? (
        <>
          <div className="estadisticas__banda">PORTERÍA · {stats.estadisticasDefensa.pctParadas}% de eficacia</div>
          <ResumenCifras resumen={resumenLanz} titulos={["Recibidos", "Goles encajados", "Paradas", "Fueras"]} />
        </>
      ) : (
        <>
          <div className="estadisticas__banda">LANZAMIENTOS</div>
          <ResumenCifras resumen={resumenLanz} />
        </>
      )}

      <div className="carrusel-paneles">
        <div className="carrusel-paneles__pista" ref={pistaRef} onScroll={manejarScroll}>
          <div className="carrusel-paneles__panel">
            <div className="estadisticas__banda">{tituloZonas}</div>
            <MapaEficacia
              porZonaPorteria={eficaciaZonas.porZonaPorteria}
              porZonaLanz={eficaciaZonas.porZonaLanz}
              variant={variant}
            />
          </div>
          <div className="carrusel-paneles__panel">
            <div className="estadisticas__banda">{tituloZonas7m}</div>
            <MapaEficacia
              porZonaPorteria={eficaciaZonas7m.porZonaPorteria}
              porZonaLanz={eficaciaZonas7m.porZonaLanz}
              variant={variant}
            />
          </div>
        </div>
        <div className="carrusel-paneles__puntos">
          {[tituloZonas, tituloZonas7m].map((etiqueta, indice) => (
            <button
              key={etiqueta}
              type="button"
              className={`carrusel-paneles__punto ${panelActivo === indice ? "is-activo" : ""}`}
              aria-label={etiqueta}
              aria-current={panelActivo === indice}
              onClick={() => irAPanel(indice)}
            />
          ))}
        </div>
      </div>

      <div className="estadisticas__banda">TODAS LAS ACCIONES</div>
      <div className="acciones-contextos">
        <div className="acciones-contextos__columna panel-contexto panel-contexto--ataque">
          <h3 className="acciones-contextos__titulo">Ataque</h3>
          <div className="acciones-contextos__lista">
            <ListaAcciones resumen={stats.estadisticasAtaque} contexto="ATQ" />
          </div>
        </div>
        <div className="acciones-contextos__columna panel-contexto panel-contexto--defensa">
          <h3 className="acciones-contextos__titulo">Defensa</h3>
          <div className="acciones-contextos__lista">
            <ListaAcciones resumen={stats.estadisticasDefensa} contexto="DEF" />
          </div>
        </div>
      </div>

      <BandaSanciones titulo={tituloSanciones} sanciones={stats.sanciones} />
    </>
  );
}
