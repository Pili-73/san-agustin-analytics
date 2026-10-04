import { describirAccion, contextoAccion, ladoTiempoMuerto } from "../../utils/categoriasAccion";
import IndicadorAccion from "../comun/IndicadorAccion";

// Todas las acciones del partido (ataque + defensa + sanciones), ordenadas
// por minuto:segundo, para localizar y revisar en vídeo cualquier jugada
// concreta. En dos columnas -Agustinos a la izquierda, el rival a la
// derecha- pegadas a un eje central, así la columna ya dice si fue nuestro
// o del rival sin tener que repetirlo en el texto de cada fila; el orden de
// arriba a abajo sigue siendo el único cronológico del partido,
// entrelazando ambas columnas según toque.
export default function LineaTiempo({ acciones, catalogoPorContexto, equipoNombre, rivalNombre }) {
  if (acciones.length === 0) return null;

  return (
    <section className="linea-tiempo">
      <h3 className="linea-tiempo__titulo">Línea del tiempo</h3>
      <div className="linea-tiempo__cabecera">
        <span className="linea-tiempo__cabecera-col linea-tiempo__cabecera-col--agustinos">{equipoNombre || "Agustinos"}</span>
        <span className="linea-tiempo__cabecera-col linea-tiempo__cabecera-col--rival">{rivalNombre || "Rival"}</span>
      </div>
      <ol className="linea-tiempo__lista">
        {acciones.map((accion) => {
          // Un tiempo muerto no es una jugada de ningún lado: va como una
          // línea centrada que cruza las dos columnas.
          const ladoTM = ladoTiempoMuerto(accion);
          if (ladoTM) {
            const equipo = ladoTM === "agustinos" ? equipoNombre || "Agustinos" : rivalNombre || "Rival";
            return (
              <li key={accion.id_accion ?? `tm-${accion.tiempo}`} className="linea-tiempo__renglon linea-tiempo__renglon--tiempo-muerto">
                <span className="linea-tiempo__tiempo-muerto">
                  <span aria-hidden="true">⏱</span> {accion.tiempo} · Timeout {equipo}
                </span>
              </li>
            );
          }
          const { titulo, color } = describirAccion(accion, catalogoPorContexto);
          const contexto = contextoAccion(accion);
          return (
            <li key={accion.id_accion} className={`linea-tiempo__renglon linea-tiempo__renglon--${contexto}`}>
              <div className="linea-tiempo__fila">
                <span className="linea-tiempo__tiempo">{accion.tiempo}</span>
                <IndicadorAccion codigo={accion.at_def_san} fin={accion.fin} color={color} />
                <span className="linea-tiempo__titulo-accion">{titulo}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
