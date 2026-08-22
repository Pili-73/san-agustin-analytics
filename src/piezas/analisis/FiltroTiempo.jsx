const PRIMERA_PARTE = [0, 30];
const SEGUNDA_PARTE = [30, 60];

function mismoRango(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1];
}

// Filtro de tiempo compartido por ambas hojas de estadísticas: los dos
// atajos habituales (por parte) más una barra de doble tirador para acotar
// cualquier intervalo. rango es [inicio, fin] en minutos, o null (todo el
// partido); onChange(rango) se llama con el nuevo valor en cada interacción.
export default function FiltroTiempo({ rango, onChange, maxMinutos = 60 }) {
  const [inicio, fin] = rango || [0, maxMinutos];

  const moverInicio = (valor) => {
    onChange([Math.min(Number(valor), fin), fin]);
  };
  const moverFin = (valor) => {
    onChange([inicio, Math.max(Number(valor), inicio)]);
  };

  return (
    <div className="filtro-tiempo">
      <div className="filtro-tiempo__presets">
        <button
          type="button"
          className={!rango ? "is-selected" : ""}
          onClick={() => onChange(null)}
        >
          Todo el partido
        </button>
        <button
          type="button"
          className={mismoRango(rango, PRIMERA_PARTE) ? "is-selected" : ""}
          onClick={() => onChange(PRIMERA_PARTE)}
        >
          1ª parte
        </button>
        <button
          type="button"
          className={mismoRango(rango, SEGUNDA_PARTE) ? "is-selected" : ""}
          onClick={() => onChange(SEGUNDA_PARTE)}
        >
          2ª parte
        </button>
      </div>

      <div className="filtro-tiempo__rango">
        <span className="filtro-tiempo__etiqueta">
          {Math.round(inicio)}′ – {Math.round(fin)}′
        </span>
        <div className="filtro-tiempo__pista">
          <div
            className="filtro-tiempo__relleno"
            style={{
              left: `${(inicio / maxMinutos) * 100}%`,
              right: `${100 - (fin / maxMinutos) * 100}%`,
            }}
          />
          <input
            type="range"
            min={0}
            max={maxMinutos}
            value={inicio}
            step={1}
            onChange={(event) => moverInicio(event.target.value)}
            aria-label="Minuto inicial del intervalo"
            style={{ zIndex: inicio > maxMinutos / 2 ? 4 : 3 }}
          />
          <input
            type="range"
            min={0}
            max={maxMinutos}
            value={fin}
            step={1}
            onChange={(event) => moverFin(event.target.value)}
            aria-label="Minuto final del intervalo"
            style={{ zIndex: fin > maxMinutos / 2 ? 3 : 4 }}
          />
        </div>
      </div>
    </div>
  );
}
