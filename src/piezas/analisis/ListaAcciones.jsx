import { categoriasPorContexto } from "../../utils/categoriasAccion";
import { colorOpcion } from "../../utils/coloresAccion";

// Las categorías de acción de un contexto, cada una con el mismo color que
// se usa al registrarla en Directo. Sin contenedor propio: el layout (grid,
// columnas...) lo pone quien la use.
// contexto: "ATQ" | "DEF" — decide qué título/clave llevan las filas que
// varían por contexto (p.ej. "Pérdidas"/"Intercepciones") y su color.
export default function ListaAcciones({ resumen, contexto }) {
  return (
    <>
      {categoriasPorContexto(contexto).map((fila) => (
        <div
          className={`otras-acciones__item ${fila.anchoCompleto ? "otras-acciones__item--completo" : ""}`}
          key={fila.clave}
        >
          <span className={`indicador-color indicador-color--${colorOpcion(contexto, fila.fin)}`} aria-hidden="true" />
          <strong>{resumen[fila.clave]}</strong>
          <span>{fila.titulo}</span>
        </div>
      ))}
    </>
  );
}
