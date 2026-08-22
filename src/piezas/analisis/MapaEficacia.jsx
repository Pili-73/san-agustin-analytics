import { ZONAS_LANZAMIENTO, centroideZona } from "../../utils/zonasCampo";

const ZONA_VACIA = { goles: 0, lanzamientos: 0 };

function formatearFraccion(zona = ZONA_VACIA) {
  return zona.lanzamientos > 0 ? `${zona.goles}/${zona.lanzamientos}` : "–";
}

// Superpone, sobre la misma imagen de portería que usa Directo, la fracción
// goles/lanzamientos de cada una de las 9 zonas de portería y de las 9 zonas
// de lanzamiento — mismo layout que los selectores de Directo, pero de solo
// lectura.
export default function MapaEficacia({ titulo, porZonaPorteria, porZonaLanz, variant }) {
  return (
    <div className="mapa-eficacia">
      {titulo && <h3 className="mapa-eficacia__titulo">{titulo}</h3>}
      <div className="mapa-eficacia__imagen">
        <img src="/porteria_estadisticas.jpg" alt="Eficacia por zona de portería y de lanzamiento" />
        <div className={`mapa-eficacia__cuadrantes mapa-eficacia__cuadrantes--${variant}`}>
          {Array.from({ length: 9 }, (_, i) => i + 1).map((zona) => (
            <div className="mapa-eficacia__celda" key={zona}>
              <span className="mapa-eficacia__celda-halo" aria-hidden="true">
                {formatearFraccion(porZonaPorteria[zona])}
              </span>
              <span className="mapa-eficacia__celda-num">{formatearFraccion(porZonaPorteria[zona])}</span>
            </div>
          ))}
        </div>
        <svg
          className={`mapa-eficacia__zonas-lanz mapa-eficacia__zonas-lanz--${variant}`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {ZONAS_LANZAMIENTO.map((puntos, indice) => {
            const zona = indice + 1;
            const { x, y } = centroideZona(puntos);
            return (
              <g key={zona}>
                <polygon points={puntos} />
                <text className="mapa-eficacia__zonas-lanz-halo" x={x} y={y} aria-hidden="true">
                  {formatearFraccion(porZonaLanz[zona])}
                </text>
                <text className="mapa-eficacia__zonas-lanz-num" x={x} y={y}>
                  {formatearFraccion(porZonaLanz[zona])}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
