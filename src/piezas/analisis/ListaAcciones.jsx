// Los datos de ataque/defensa activos para el equipo (según su
// Configuración), cada uno con el mismo color que se usa al registrarlo en
// Directo. Sin contenedor propio: el layout (grid, columnas...) lo pone
// quien la use.
// opciones: catálogo ya filtrado a este contexto (ATQ|DEF) y a lo activo
// para el equipo. acciones: las acciones en bruto de ese mismo contexto.
// catalogo: catálogo completo de ese contexto, sin filtrar por selección del
// equipo -para poder titular una acción con un dato ya desactivado (o nunca
// activado) en vez de perderla del recuento; opcional, por defecto ninguno.
export default function ListaAcciones({ opciones, acciones, catalogo = [] }) {
  const finsConfigurados = new Set(opciones.map((opcion) => opcion.fin));

  // Cualquier código `fin` presente en las acciones reales que no esté entre
  // las opciones activas del equipo: no se descarta del recuento, se titula
  // con el catálogo completo si está (aunque el equipo lo tenga desactivado)
  // y, si ni siquiera está en el catálogo, con el propio código en bruto.
  const finsExtra = [...new Set(acciones.map((accion) => accion.fin))].filter(
    (fin) => fin && !finsConfigurados.has(fin)
  );
  const extras = finsExtra.map((fin) => {
    const enCatalogo = catalogo.find((opcion) => opcion.fin === fin);
    return enCatalogo || { id: `extra-${fin}`, fin, titulo: fin, color: "gris" };
  });

  // Agrupadas por color -rojo, luego gris, luego verde-, con el orden
  // configurado dentro de cada grupo: así una opción fuera de configuración
  // cae junto a las de su mismo color en vez de siempre al final.
  const ordenColor = { rojo: 0, gris: 1, verde: 2 };
  const items = [...opciones, ...extras].sort(
    (a, b) => (ordenColor[a.color] ?? 1) - (ordenColor[b.color] ?? 1)
  );

  return (
    <>
      {items.map((opcion) => (
        <div className="otras-acciones__item" key={opcion.id}>
          <span className={`indicador-color indicador-color--${opcion.color}`} aria-hidden="true" />
          <strong>{acciones.filter((accion) => accion.fin === opcion.fin).length}</strong>
          <span>{opcion.titulo}</span>
        </div>
      ))}
    </>
  );
}
