// Bloque de sanciones (partido, jugador o temporada): misma banda y misma
// disposición en las tres pantallas, solo cambia el título y los datos.
export default function BandaSanciones({ titulo, sanciones }) {
  return (
    <>
      <div className="estadisticas__banda estadisticas__banda--sanciones">{titulo}</div>
      <div className="estadisticas__sanciones">
        <span><strong>{sanciones.exclusiones}</strong> exclusiones (2 min)</span>
        <span><strong>{sanciones.amarillas}</strong> amarillas</span>
        <span><strong>{sanciones.rojas}</strong> rojas</span>
        <span><strong>{sanciones.azules}</strong> azules</span>
      </div>
    </>
  );
}
