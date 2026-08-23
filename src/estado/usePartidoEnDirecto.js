import { useEffect, useRef, useState } from "react";
import { crearAccion, eliminarAccion } from "../datos/acciones";
import { formatearTiempo } from "../utils/tiempo";
import {
  encolarAccion,
  encolarBorrado,
  leerBorradosPendientes,
  leerPendientes,
  quitarDeCola,
  reencolar,
  reencolarBorrado,
  tomarSiguiente,
  tomarSiguienteBorrado,
} from "../utils/colaSincronizacion";

// Un fallo de red (wifi de pabellón cayéndose) se distingue de un error real
// del servidor porque la petición nunca llega a completarse: supabase-js lo
// envuelve como {message, details, hint:'', code:''} -con code VACÍO-, no
// como el TypeError de fetch original ni con un código real de Postgrest
// (una violación de RLS o de clave foránea siempre trae un code no vacío).
function esErrorDeRed(err) {
  return !navigator.onLine || err instanceof TypeError || !err?.code;
}

export function usePartidoEnDirecto(partidoId) {
  const [marcador, setMarcador] = useState({ golesAgustinos: 0, golesRival: 0 });
  const [aviso, setAviso] = useState(null);
  const [avisoTipo, setAvisoTipo] = useState("info");
  const [avisoId, setAvisoId] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [pendientes, setPendientes] = useState(() => leerPendientes(partidoId));
  const [pendientesBorrado, setPendientesBorrado] = useState(() => leerBorradosPendientes(partidoId).length);
  const [ultimaAccion, setUltimaAccion] = useState(null);
  const startTimeRef = useRef(0);
  const intervalRef = useRef(null);

  const mostrarAviso = (mensaje, tipo = "info") => {
    setAviso(mensaje);
    setAvisoTipo(tipo);
    setAvisoId((actual) => actual + 1);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Reintenta subir la cola pendiente al recuperar conexión y cada 15s
  // mientras quede algo por sincronizar; sigue vivo durante toda la pantalla
  // de Directo, no solo justo después de guardar una acción.
  useEffect(() => {
    let activo = true;

    const intentarVaciarCola = async () => {
      let item;
      // tomarSiguiente saca el elemento de la cola antes de intentar subirlo:
      // si el reintento global de la app coge otro a la vez, nunca chocan.
      while (activo && (item = tomarSiguiente(partidoId))) {
        try {
          await crearAccion(item.accion);
          setPendientes(leerPendientes(partidoId));
        } catch {
          reencolar(partidoId, item);
          setPendientes(leerPendientes(partidoId));
          break; // sigue sin red (u otro fallo persistente): se reintenta en el siguiente ciclo
        }
      }

      let idAccion;
      while (activo && (idAccion = tomarSiguienteBorrado(partidoId))) {
        try {
          await eliminarAccion(idAccion);
          setPendientesBorrado(leerBorradosPendientes(partidoId).length);
        } catch {
          reencolarBorrado(partidoId, idAccion);
          setPendientesBorrado(leerBorradosPendientes(partidoId).length);
          break;
        }
      }
    };

    intentarVaciarCola();
    window.addEventListener("online", intentarVaciarCola);
    const intervalo = setInterval(intentarVaciarCola, 15000);

    return () => {
      activo = false;
      window.removeEventListener("online", intentarVaciarCola);
      clearInterval(intervalo);
    };
  }, [partidoId]);

  const iniciarCronometro = () => {
    if (running) return;
    startTimeRef.current = Date.now() - elapsedMs;
    setRunning(true);
  };

  const pausarCronometro = () => {
    if (!running) return;
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const fijarElapsed = (ms) => {
    setElapsedMs(ms);
    startTimeRef.current = Date.now() - ms;
  };

  const establecerTiempoManual = (minutos, segundos) => {
    fijarElapsed((minutos * 60 + segundos) * 1000);
  };

  // Restaura un cronómetro guardado (p.ej. al volver de Estadísticas) sin pasar por minutos/segundos.
  // Si seguía en marcha al salir, además lo reanuda: el partido no se "pausa"
  // por consultar estadísticas, el reloj sigue corriendo aunque no se vea.
  const restaurarCronometro = (ms, corriendo) => {
    fijarElapsed(ms || 0);
    if (corriendo) setRunning(true);
  };

  // Restaura el marcador guardado (p.ej. al volver de Estadísticas).
  const restaurarMarcador = (golesAgustinos, golesRival) => {
    setMarcador({ golesAgustinos: golesAgustinos || 0, golesRival: golesRival || 0 });
  };

  const aplicarGolSiCorresponde = (accion, signo) => {
    if (accion.gol_parada_fuera !== "GOL") return;
    setMarcador((actual) =>
      accion.at_def_san === "DEF"
        ? { ...actual, golesRival: Math.max(0, actual.golesRival + signo) }
        : { ...actual, golesAgustinos: Math.max(0, actual.golesAgustinos + signo) }
    );
  };

  const guardarAccion = async (accion) => {
    if (!partidoId || guardando) return false;

    setGuardando(true);
    const payload = { id_partido: partidoId, ...accion, tiempo: formatearTiempo(elapsedMs) };
    try {
      const creada = await crearAccion(payload);
      aplicarGolSiCorresponde(accion, 1);
      setUltimaAccion({ accion, idAccion: creada.id_accion, idLocal: null });
      mostrarAviso("Acción guardada", "ok");
      return true;
    } catch (err) {
      if (esErrorDeRed(err)) {
        // Sin conexión: se guarda localmente y se sube sola en cuanto vuelva
        // la red, sin bloquear al usuario ni perder el dato.
        const { idLocal, cola } = encolarAccion(partidoId, payload);
        setPendientes(cola);
        aplicarGolSiCorresponde(accion, 1);
        setUltimaAccion({ accion, idAccion: null, idLocal });
        mostrarAviso("Sin conexión: se guardará cuando vuelva la red", "pendiente");
        return true;
      }
      console.error("Error creando acción", err);
      mostrarAviso("No se pudo guardar la acción.", "error");
      return false;
    } finally {
      setGuardando(false);
    }
  };

  // Deshace solo la última acción (no hay historial de varios pasos): borra
  // la fila si ya se sincronizó, o la quita de la cola si seguía pendiente.
  // Si el borrado falla por red, se encola igual que al guardar: se aplica
  // ya en cliente (marcador y estadísticas) y se reintenta solo al volver la
  // conexión, en vez de dejar la acción errónea sin poder deshacerla.
  const deshacerUltimaAccion = async () => {
    if (!ultimaAccion || guardando) return false;

    setGuardando(true);
    try {
      let mensaje = "Acción deshecha";
      let tipo = "ok";

      if (ultimaAccion.idAccion != null) {
        try {
          await eliminarAccion(ultimaAccion.idAccion);
        } catch (err) {
          if (!esErrorDeRed(err)) throw err;
          setPendientesBorrado(encolarBorrado(partidoId, ultimaAccion.idAccion).length);
          mensaje = "Sin conexión: se deshará cuando vuelva la red";
          tipo = "pendiente";
        }
      } else {
        setPendientes(quitarDeCola(partidoId, ultimaAccion.idLocal));
      }

      aplicarGolSiCorresponde(ultimaAccion.accion, -1);
      setUltimaAccion(null);
      mostrarAviso(mensaje, tipo);
      return true;
    } catch (err) {
      console.error("Error deshaciendo la última acción", err);
      mostrarAviso("No se pudo deshacer la acción.", "error");
      return false;
    } finally {
      setGuardando(false);
    }
  };

  return {
    marcador,
    aviso,
    avisoTipo,
    avisoId,
    guardando,
    limpiarAviso: () => setAviso(null),
    elapsedMs,
    running,
    pendientes,
    pendientesBorrado,
    puedeDeshacer: ultimaAccion != null,
    iniciarCronometro,
    pausarCronometro,
    establecerTiempoManual,
    restaurarCronometro,
    restaurarMarcador,
    guardarAccion,
    deshacerUltimaAccion,
  };
}
