// Minutos jugados de un jugador. Con `intervalos` (vista de un partido
// concreto): total + lista "mm-mm" de cada tramo en pista. Con `partidos`
// en su lugar (vista de temporada): total sobre 60 × nº de partidos.
export default function MinutosJugados({ minutosJugados }) {
  if (!minutosJugados) return null;
  const { totalMinutos, intervalos, partidos } = minutosJugados;
  const minutos = Math.floor(totalMinutos);

  return (
    <>
      <div className="estadisticas__banda">MINUTOS JUGADOS</div>
      <div className="minutos-jugados">
        <p className="minutos-jugados__total">
          <strong>{minutos}</strong>
          {partidos != null ? <span> / {60 * partidos} min ({partidos} partido{partidos === 1 ? "" : "s"})</span> : <span> min</span>}
        </p>
        {intervalos && (
          intervalos.length > 0 ? (
            <div className="minutos-jugados__intervalos">
              {intervalos.map(([inicio, fin], indice) => (
                <span className="minutos-jugados__intervalo" key={indice}>{Math.floor(inicio)}-{Math.floor(fin)}</span>
              ))}
            </div>
          ) : (
            <p className="estado-carga">No ha jugado en este partido.</p>
          )
        )}
      </div>
    </>
  );
}
