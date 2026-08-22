// Cifras clave del contexto (ataque o defensa), como tarjetas grandes y
// escaneables antes de entrar en el detalle de las barras.
export default function ResumenCifras({ resumen, titulos = ["Lanzamientos", "Goles", "Paradas", "Fueras"] }) {
  const tiles = [
    { titulo: titulos[0], valor: resumen.lanzamientos },
    { titulo: titulos[1], valor: resumen.goles, pct: resumen.pctGoles, tono: "verde" },
    { titulo: titulos[2], valor: resumen.paradas, pct: resumen.pctParadas, tono: "azul" },
    { titulo: titulos[3], valor: resumen.fueras, pct: resumen.pctFueras, tono: "malo" },
  ];

  return (
    <div className="resumen-cifras">
      {tiles.map((tile) => (
        <div className={`resumen-cifras__tile ${tile.tono ? `resumen-cifras__tile--${tile.tono}` : ""}`} key={tile.titulo}>
          <strong>{tile.valor}</strong>
          <span>{tile.titulo}</span>
          {tile.pct != null && <small>{tile.pct}%</small>}
        </div>
      ))}
    </div>
  );
}
