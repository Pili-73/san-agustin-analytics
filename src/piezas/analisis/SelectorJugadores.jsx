import { Link } from "react-router-dom";

// Selector de jugador, compartido por la pantalla de partido y la de
// temporada. enlaceJugador(jugador) construye la ruta de cada píldora — en
// temporada, la del jugador ya seleccionado apunta de vuelta a "todo el
// equipo" para poder deseleccionar tocándola otra vez. enlaceTodos, si se
// pasa, añade la píldora "Todo el equipo" al principio.
export default function SelectorJugadores({
  jugadores,
  seleccionadoId,
  enlaceJugador,
  enlaceTodos = null,
  etiquetaTodos = "Todo el equipo",
  state,
  aria,
}) {
  return (
    <nav className="jugadores-switch" aria-label={aria}>
      {enlaceTodos && (
        <Link
          to={enlaceTodos}
          replace
          state={state}
          className={`jugadores-switch__pill ${seleccionadoId == null ? "is-selected" : ""}`}
        >
          {etiquetaTodos}
        </Link>
      )}
      {jugadores.map((jugador) => (
        <Link
          key={jugador.id}
          to={enlaceJugador(jugador)}
          replace
          state={state}
          className={[
            "jugadores-switch__pill",
            jugador.id === seleccionadoId ? "is-selected" : "",
            jugador.posicion?.toLowerCase() === "portero" ? "jugadores-switch__pill--portero" : "",
          ].filter(Boolean).join(" ")}
        >
          <strong>{jugador.dorsal}</strong> {jugador.apellido}
        </Link>
      ))}
    </nav>
  );
}
