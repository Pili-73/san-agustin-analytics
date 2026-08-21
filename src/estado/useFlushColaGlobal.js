import { useEffect } from "react";
import { crearAccion } from "../datos/acciones";
import { idsPartidosConCola, reencolar, tomarSiguiente } from "../utils/colaSincronizacion";

// Red de seguridad a nivel de app: usePartidoEnDirecto ya reintenta subir la
// cola de SU partido mientras está abierta esa pantalla, pero si el partido
// se dio por acabado sin conexión (y no se vuelve a abrir su Directo), sus
// acciones se quedarían encoladas para siempre. Este hook, montado una vez en
// App, revisa TODOS los partidos con cola pendiente y los reintenta, esté
// donde esté el usuario dentro de la aplicación.
export function useFlushColaGlobal() {
  useEffect(() => {
    const intentarVaciarTodas = async () => {
      for (const partidoId of idsPartidosConCola()) {
        let item;
        // tomarSiguiente es atómica: si usePartidoEnDirecto está reintentando
        // a la vez la cola de ese mismo partido, nunca cogen el mismo elemento.
        while ((item = tomarSiguiente(partidoId))) {
          try {
            await crearAccion(item.accion);
          } catch {
            reencolar(partidoId, item);
            break; // este partido sigue sin poder subir; se prueba en el siguiente ciclo
          }
        }
      }
    };

    intentarVaciarTodas();
    window.addEventListener("online", intentarVaciarTodas);
    const intervalo = setInterval(intentarVaciarTodas, 30000);

    return () => {
      window.removeEventListener("online", intentarVaciarTodas);
      clearInterval(intervalo);
    };
  }, []);
}
