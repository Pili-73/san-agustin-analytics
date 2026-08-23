import ListaAcciones from "./ListaAcciones";

// Detalle secundario, oculto tras un desplegable para no saturar la vista
// principal (que ya tiene las cifras clave y las barras).
export default function OtrasAcciones({ resumen, contexto }) {
  return (
    <details className="otras-acciones">
      <summary>Ver todas las acciones</summary>
      <div className="otras-acciones__grid">
        <ListaAcciones resumen={resumen} contexto={contexto} />
      </div>
    </details>
  );
}
