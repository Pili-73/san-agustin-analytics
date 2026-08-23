import BarraSegmentada from "./BarraSegmentada";
import MapaEficacia from "./MapaEficacia";

// Una fila desplegable: barra de progreso con el peso de la categoría sobre
// el total del contexto, y al abrirla el desglose de sus lanzamientos (cómo
// terminaron las posesiones que no fueron lanzamiento, y su resultado
// goles/paradas/fueras). La fila "7 m" es un caso especial: al ser siempre
// lanzamientos (penaltis), no tiene sentido la barra de posesión — en su
// lugar se muestra el mapa de eficacia de esos lanzamientos.
export default function BarraDesglose({ fila, variant, abierto, onToggle, eficaciaZonas7m }) {
  const tieneDatos = fila.cuenta > 0;
  const es7m = fila.value === "7M" && Boolean(eficaciaZonas7m);

  return (
    <div className="barra-desglose">
      <button
        type="button"
        className="barra-desglose__cabecera"
        onClick={onToggle}
        aria-expanded={abierto}
        disabled={!tieneDatos}
      >
        <span className="barra-desglose__etiqueta">{fila.label}</span>
        <span className="barra-desglose__pista">
          <span
            className={`barra-desglose__relleno barra-desglose__relleno--${variant}`}
            style={{ width: `${fila.porcentaje}%` }}
          />
        </span>
        <span className="barra-desglose__cifras">
          {fila.cuenta} <small>({fila.porcentaje}%)</small>
        </span>
        {tieneDatos && (
          <span className="barra-desglose__flecha" aria-hidden="true">
            {abierto ? "▲" : "▼"}
          </span>
        )}
      </button>
      {abierto && tieneDatos && (
        <div className="barra-desglose__detalle">
          {!es7m && (
            <BarraSegmentada
              segmentos={[
                { etiqueta: "lanzamientos", valor: fila.lanzamientos, pct: fila.pctLanzamientos, tono: "verde" },
                { etiqueta: "pérdidas", valor: fila.cambiosPosesion, pct: fila.pctCambiosPosesion, tono: "malo" },
                { etiqueta: "continuidades", valor: fila.continuidades, pct: fila.pctContinuidades, tono: "gris" },
              ]}
            />
          )}
          <BarraSegmentada
            segmentos={[
              { etiqueta: "goles", valor: fila.goles, pct: fila.pctGoles, tono: "verde" },
              { etiqueta: "paradas", valor: fila.paradas, pct: fila.pctParadas, tono: "azul" },
              { etiqueta: "fueras", valor: fila.fueras, pct: fila.pctFueras, tono: "malo" },
            ]}
          />
          {es7m && (
            <MapaEficacia
              titulo="Eficacia de 7 m"
              porZonaPorteria={eficaciaZonas7m.porZonaPorteria}
              porZonaLanz={eficaciaZonas7m.porZonaLanz}
              variant={variant}
            />
          )}
        </div>
      )}
    </div>
  );
}
