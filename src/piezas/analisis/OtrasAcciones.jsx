const FILAS = [
  { clave: "perdidas", titulo: "Pérdidas" },
  { clave: "infracciones", titulo: "Infracciones" },
  { clave: "faltasAtaque", titulo: "Faltas de ataque" },
  { clave: "faltasRecibidas", titulo: "Faltas recibidas" },
  { clave: "bloqueos", titulo: "Bloqueos" },
  { clave: "intercepciones", titulo: "Intercepciones" },
  { clave: "unoVsUno", titulo: "1 vs 1" },
  { clave: "dosVsDos", titulo: "2 vs 2" },
  { clave: "penaltis", titulo: "7 m" },
  { clave: "exclusiones", titulo: "Exclusiones" },
];

// Detalle secundario, oculto tras un desplegable para no saturar la vista
// principal (que ya tiene las cifras clave y las barras).
export default function OtrasAcciones({ resumen }) {
  return (
    <details className="otras-acciones">
      <summary>Ver todas las acciones</summary>
      <div className="otras-acciones__grid">
        {FILAS.map((fila) => (
          <div className="otras-acciones__item" key={fila.clave}>
            <strong>{resumen[fila.clave]}</strong>
            <span>{fila.titulo}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
