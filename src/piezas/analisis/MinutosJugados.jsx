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
            <div className="minutos-jugados__intervalos-scroll">
              <div className="minutos-jugados__intervalos">
                {intervalos.map(([inicio, fin], indice) => {
                  const desde = Math.floor(inicio);
                  // Si de verdad estuvo en pista (fin > inicio) pero los dos
                  // caen en el mismo minuto redondeado (p.ej. entra y sale en
                  // los mismos segundos), forzar al menos un minuto de ancho:
                  // "36-36" parece que no jugó nada, aunque sí contase tiempo.
                  const hasta = fin > inicio ? Math.max(Math.floor(fin), desde + 1) : desde;
                  return <span className="minutos-jugados__intervalo" key={indice}>{desde}-{hasta}</span>;
                })}
              </div>
            </div>
          ) : (
            <p className="estado-carga">No ha jugado en este partido.</p>
          )
        )}
      </div>
    </>
  );
}
