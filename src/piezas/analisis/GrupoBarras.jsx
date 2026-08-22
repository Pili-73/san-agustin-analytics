import { useState } from "react";
import BarraDesglose from "./BarraDesglose";

// Un grupo de barras desplegables (p.ej. "Situación ofensiva"). Solo una
// puede estar abierta a la vez, como un acordeón.
export default function GrupoBarras({ titulo, datos, variant, mostrarPosesion }) {
  const [abierto, setAbierto] = useState(null);

  return (
    <div className="grupo-barras">
      <h3 className="grupo-barras__titulo">{titulo}</h3>
      {datos.map((fila) => (
        <BarraDesglose
          key={fila.value}
          fila={fila}
          variant={variant}
          abierto={abierto === fila.value}
          onToggle={() => setAbierto((actual) => (actual === fila.value ? null : fila.value))}
          mostrarPosesion={mostrarPosesion}
        />
      ))}
    </div>
  );
}
