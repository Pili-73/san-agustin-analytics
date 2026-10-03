import { describirAccion, contextoAccion } from "../../utils/categoriasAccion";

// Todas las acciones del partido (ataque + defensa + sanciones), ordenadas
// por minuto:segundo, para localizar y revisar en vídeo cualquier jugada
// concreta. En dos columnas -a favor a la izquierda, en contra a la
// derecha- pegadas a un eje central, así la columna ya dice si fue nuestro
// o del rival sin tener que repetirlo en el texto de cada fila; el orden de
// arriba a abajo sigue siendo el único cronológico del partido,
// entrelazando ambas columnas según toque.
export default function LineaTiempo({ acciones, catalogoPorContexto }) {
  if (acciones.length === 0) return null;

  return (
    <section className="linea-tiempo">
      <h3 className="linea-tiempo__titulo">Línea del tiempo</h3>
      <div className="linea-tiempo__cabecera">
        <span className="linea-tiempo__cabecera-col linea-tiempo__cabecera-col--favor">A favor</span>
        <span className="linea-tiempo__cabecera-col linea-tiempo__cabecera-col--contra">En contra</span>
      </div>
      <ol className="linea-tiempo__lista">
        {acciones.map((accion) => {
          const { titulo, color } = describirAccion(accion, catalogoPorContexto);
          const contexto = contextoAccion(accion);
          return (
            <li key={accion.id_accion} className={`linea-tiempo__renglon linea-tiempo__renglon--${contexto}`}>
              <div className="linea-tiempo__fila">
                <span className="linea-tiempo__tiempo">{accion.tiempo}</span>
                <span className={`indicador-color indicador-color--${color}`} aria-hidden="true" />
                <span className="linea-tiempo__titulo-accion">{titulo}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
