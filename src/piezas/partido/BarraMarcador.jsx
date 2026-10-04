// situacionNumerica: "SUP" | "INF" | null. Se muestra a la izquierda del
// nombre de Agustinos mientras un equipo tenga más exclusiones en curso que el otro.
export default function BarraMarcador({ equipo, rival, marcador, tiempo, tiempoMuerto, parte, situacionNumerica, onAbrirMenu }) {
  return (
    <header className="marcador-bar">
      <span className="marcador-bar__parte">{parte === 1 ? "1ª parte" : "2ª parte"}</span>
      <button className="marcador marcador--boton" type="button" onClick={onAbrirMenu} aria-label="Abrir opciones del marcador">
        {/* La etiqueta flota a la izquierda del nombre, fuera del flujo: así
            aparecer o desaparecer no desplaza el marcador. */}
        <span className="marcador__equipo">
          {situacionNumerica && (
            <span className={`marcador__situacion etiqueta-igualdad etiqueta-igualdad--${situacionNumerica.toLowerCase()}`}>
              {situacionNumerica === "SUP" ? "Sup" : "Inf"}
            </span>
          )}
          <span className="equipo-nombre">{equipo || "Agustinos"}</span>
        </span>
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
