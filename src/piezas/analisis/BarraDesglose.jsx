// Una fila desplegable: barra de progreso con el peso de la categoría sobre
// el total del contexto, y al abrirla el desglose de sus lanzamientos.
export default function BarraDesglose({ fila, variant, abierto, onToggle }) {
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
  );
}
