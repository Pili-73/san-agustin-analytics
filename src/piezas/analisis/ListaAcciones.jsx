// Los datos de ataque/defensa activos para el equipo (según su
// Configuración), cada uno con el mismo color que se usa al registrarlo en
// Directo. Sin contenedor propio: el layout (grid, columnas...) lo pone
// quien la use.
// opciones: catálogo ya filtrado a este contexto (ATQ|DEF) y a lo activo
// para el equipo. acciones: las acciones en bruto de ese mismo contexto.
export default function ListaAcciones({ opciones, acciones }) {
  return (
    <>
      {opciones.map((opcion) => (
        <div className="otras-acciones__item" key={opcion.id}>
          <span className={`indicador-color indicador-color--${opcion.color}`} aria-hidden="true" />
          <strong>{acciones.filter((accion) => accion.fin === opcion.fin).length}</strong>
          <span>{opcion.titulo}</span>
        </div>
      ))}
    </>
  );
}
