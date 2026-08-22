import BarraSegmentada from "./BarraSegmentada";

// Una fila desplegable: barra de progreso con el peso de la categoría sobre
// el total del contexto, y al abrirla el desglose de sus lanzamientos. En el
// desglose de situación ofensiva (mostrarPosesion) se añade cómo terminaron
// las posesiones que no fueron lanzamiento: cambio de posesión o continuidad.
export default function BarraDesglose({ fila, variant, abierto, onToggle, mostrarPosesion }) {
  const tieneDatos = fila.cuenta > 0;

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
          {mostrarPosesion ? (
            <>
              <BarraSegmentada
                segmentos={[
                  { etiqueta: "lanzamientos", valor: fila.lanzamientos, tono: variant },
                  { etiqueta: "pérdidas", valor: fila.cambiosPosesion, tono: "malo" },
                  { etiqueta: "continuidades", valor: fila.continuidades, tono: "gris" },
                ]}
              />
              <BarraSegmentada
                segmentos={[
                  { etiqueta: "goles", valor: fila.goles, pct: fila.pctGoles, tono: "verde" },
                  { etiqueta: "paradas", valor: fila.paradas, pct: fila.pctParadas, tono: "azul" },
                  { etiqueta: "fueras", valor: fila.fueras, pct: fila.pctFueras, tono: "malo" },
                ]}
              />
            </>
          ) : (
            <div className="barra-desglose__fila">
              <span>
                <strong>{fila.lanzamientos}</strong> lanzamientos
              </span>
              <span>
                <strong>{fila.goles}</strong> goles <small>({fila.pctGoles}%)</small>
              </span>
              <span>
                <strong>{fila.paradas}</strong> paradas <small>({fila.pctParadas}%)</small>
              </span>
              <span>
                <strong>{fila.fueras}</strong> fueras <small>({fila.pctFueras}%)</small>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
