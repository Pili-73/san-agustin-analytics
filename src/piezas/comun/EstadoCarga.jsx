// Envuelve el habitual "cargando… / error / contenido" de las pantallas con
// listados, para no repetir las mismas tres condiciones en cada una.
export default function EstadoCarga({ cargando, error, mensajeCargando = "Cargando…", children }) {
  if (cargando) return <p className="estado-carga">{mensajeCargando}</p>;
  if (error) return <p className="estado-carga texto-error">{error}</p>;
  return children ?? null;
}
