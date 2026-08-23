import { useState } from "react";
import BarraDesglose from "./BarraDesglose";

// Un grupo de barras desplegables (p.ej. "Situación ofensiva"). Se pueden
// abrir varias a la vez, para poder compararlas.
export default function GrupoBarras({ titulo, datos, variant, eficaciaZonas7m }) {
  const [abiertos, setAbiertos] = useState(() => new Set());

  const alternar = (value) => {
    setAbiertos((actuales) => {
      const siguiente = new Set(actuales);
      if (siguiente.has(value)) siguiente.delete(value);
      else siguiente.add(value);
      return siguiente;
    });
  };

  return (
    <div className="grupo-barras">
      <h3 className="grupo-barras__titulo">{titulo}</h3>
      {datos.map((fila) => (
        <BarraDesglose
          key={fila.value}
          fila={fila}
          variant={variant}
          abierto={abiertos.has(fila.value)}
          onToggle={() => alternar(fila.value)}
          eficaciaZonas7m={eficaciaZonas7m}
        />
      ))}
    </div>
  );
}
