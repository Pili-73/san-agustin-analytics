const MS_POR_DIA = 86400000;

// Siempre en UTC (la "Z"): si se parseara en hora local, un huso por delante
// de UTC (como España en verano) desplazaría la fecha un día al reconstruirla
// con fechaDesdeDias, que sí es UTC (toISOString lo es siempre).
function diasDesdeEpoca(fechaISO) {
  return Math.floor(Date.parse(`${fechaISO}T00:00:00Z`) / MS_POR_DIA);
}

function fechaDesdeDias(dias) {
  return new Date(dias * MS_POR_DIA).toISOString().slice(0, 10);
}

function formatearFechaCorta(fechaISO) {
  const [, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}`;
}

// Mismo patrón que FiltroTiempo (atajo + barra de doble tirador), pero con
// las fechas de los partidos como referencia en vez de los minutos del
// partido: para las estadísticas de temporada.
export default function FiltroFechas({ rango, onChange, fechaMin, fechaMax }) {
  const diaMin = diasDesdeEpoca(fechaMin);
  const diaMax = diasDesdeEpoca(fechaMax);
  const [inicioISO, finISO] = rango || [fechaMin, fechaMax];
  const inicio = diasDesdeEpoca(inicioISO);
  const fin = diasDesdeEpoca(finISO);
  const soloUnDia = diaMin >= diaMax;

  const moverInicio = (valor) => {
    const nuevoInicio = Math.min(Number(valor), fin);
    onChange([fechaDesdeDias(nuevoInicio), fechaDesdeDias(fin)]);
  };
  const moverFin = (valor) => {
    const nuevoFin = Math.max(Number(valor), inicio);
    onChange([fechaDesdeDias(inicio), fechaDesdeDias(nuevoFin)]);
  };

  return (
    <div className="filtro-tiempo">
      <div className="filtro-tiempo__presets">
        <button type="button" className={!rango ? "is-selected" : ""} onClick={() => onChange(null)}>
          Toda la temporada
        </button>
      </div>

      <div className="filtro-tiempo__rango">
        <span className="filtro-tiempo__etiqueta">
          {formatearFechaCorta(inicioISO)} – {formatearFechaCorta(finISO)}
        </span>
        {!soloUnDia && (
          <div className="filtro-tiempo__pista">
            <div
              className="filtro-tiempo__relleno"
              style={{
                left: `${((inicio - diaMin) / (diaMax - diaMin)) * 100}%`,
                right: `${100 - ((fin - diaMin) / (diaMax - diaMin)) * 100}%`,
              }}
            />
            <input
              type="range"
              min={diaMin}
              max={diaMax}
              value={inicio}
              step={1}
              onChange={(event) => moverInicio(event.target.value)}
              aria-label="Fecha inicial del intervalo"
              style={{ zIndex: inicio > (diaMin + diaMax) / 2 ? 4 : 3 }}
            />
            <input
              type="range"
              min={diaMin}
              max={diaMax}
              value={fin}
              step={1}
              onChange={(event) => moverFin(event.target.value)}
              aria-label="Fecha final del intervalo"
              style={{ zIndex: fin > (diaMin + diaMax) / 2 ? 3 : 4 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
