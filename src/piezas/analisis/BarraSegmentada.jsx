// Una barra dividida en varios tramos proporcionales (p.ej. lanzamientos /
// pérdidas / continuidades), con su leyenda de cifras debajo. segmentos:
// [{ etiqueta, valor, tono, pct? }].
export default function BarraSegmentada({ segmentos }) {
  const total = segmentos.reduce((suma, segmento) => suma + segmento.valor, 0);

  return (
    <div className="barra-segmentada">
      <div className="barra-segmentada__pista">
        {total > 0 &&
          segmentos.map(
            (segmento) =>
              segmento.valor > 0 && (
                <span
                  key={segmento.etiqueta}
                  className={`barra-segmentada__segmento barra-segmentada__segmento--${segmento.tono}`}
                  style={{ width: `${(segmento.valor / total) * 100}%` }}
                />
              )
          )}
      </div>
      <div className="barra-segmentada__leyenda">
        {segmentos.map((segmento) => (
          <span
            key={segmento.etiqueta}
            className={`barra-segmentada__etiqueta barra-segmentada__etiqueta--${segmento.tono}`}
          >
            <strong>{segmento.valor}</strong> {segmento.etiqueta}
            {segmento.pct != null && <small> ({segmento.pct}%)</small>}
          </span>
        ))}
      </div>
    </div>
  );
}
