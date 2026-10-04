// situacionNumerica: "SUP" | "INF" | null. Se muestra junto al nombre de
// Agustinos mientras un equipo tenga más exclusiones en curso que el otro.
export default function BarraMarcador({ equipo, rival, marcador, tiempo, tiempoMuerto, parte, situacionNumerica, onAbrirMenu }) {
  return (
    <header className="marcador-bar">
      <span className="marcador-bar__parte">{parte === 1 ? "1ª parte" : "2ª parte"}</span>
      <button className="marcador marcador--boton" type="button" onClick={onAbrirMenu} aria-label="Abrir opciones del marcador">
        <span className="equipo-nombre">{equipo || "Agustinos"}</span>
        {situacionNumerica && (
          <span className={`etiqueta-igualdad etiqueta-igualdad--${situacionNumerica.toLowerCase()}`}>
            {situacionNumerica === "SUP" ? "Sup" : "Inf"}
          </span>
        )}
        <span className="goles">{marcador.golesAgustinos}</span>
        <span className="timer">{tiempo}</span>
        <span className="goles">{marcador.golesRival}</span>
        <span className="equipo-nombre">{rival || "Rival"}</span>
        {tiempoMuerto && <span className="marcador__tiempo-muerto">TM</span>}
      </button>
      <span className="marcador-bar__ayuda">Toca el marcador para opciones</span>
    </header>
  );
}
