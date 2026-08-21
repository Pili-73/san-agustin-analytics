// Cola de acciones que no se pudieron subir a Supabase (sin conexión o wifi
// inestable de pabellón). Se guarda en localStorage -no sessionStorage- para
// que sobreviva aunque se cierre el navegador antes de recuperar la red.
const PREFIJO = "cola-sync:";

function leer(partidoId) {
  try {
    const guardado = localStorage.getItem(`${PREFIJO}${partidoId}`);
    return guardado ? JSON.parse(guardado) : [];
  } catch (err) {
    console.error("No se pudo leer la cola de sincronización", err);
    return [];
  }
}

function guardar(partidoId, cola) {
  try {
    localStorage.setItem(`${PREFIJO}${partidoId}`, JSON.stringify(cola));
  } catch (err) {
    console.error("No se pudo guardar la cola de sincronización", err);
  }
}

export function leerPendientes(partidoId) {
  return leer(partidoId);
}

// Añade una acción a la cola y devuelve el id local (para poder deshacerla
// mientras siga sin sincronizar) y la cola resultante.
export function encolarAccion(partidoId, accion) {
  const idLocal = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const cola = [...leer(partidoId), { idLocal, accion }];
  guardar(partidoId, cola);
  return { idLocal, cola };
}

export function quitarDeCola(partidoId, idLocal) {
  const cola = leer(partidoId).filter((item) => item.idLocal !== idLocal);
  guardar(partidoId, cola);
  return cola;
}

// Saca el primer elemento de la cola y lo devuelve (o null si está vacía).
// Es atómica (lectura+escritura sin ningún `await` de por medio), así que dos
// reintentos a la vez -el del propio partido y el global de la app- nunca
// pueden llevarse el mismo elemento ni subirlo dos veces.
export function tomarSiguiente(partidoId) {
  const cola = leer(partidoId);
  if (cola.length === 0) return null;
  const [primero, ...resto] = cola;
  guardar(partidoId, resto);
  return primero;
}

// Si falla el intento de subida, el elemento vuelve al principio de la cola
// para no perder el orden ni el dato.
export function reencolar(partidoId, item) {
  guardar(partidoId, [item, ...leer(partidoId)]);
}

// Ids de partido con alguna acción pendiente, aunque ya no se esté viendo esa
// pantalla de Directo (p.ej. el partido se acabó offline y no se ha vuelto a
// abrir): permite un reintento a nivel de app, no solo mientras se juega.
export function idsPartidosConCola() {
  const ids = [];
  for (let i = 0; i < localStorage.length; i++) {
    const clave = localStorage.key(i);
    if (clave?.startsWith(PREFIJO)) ids.push(clave.slice(PREFIJO.length));
  }
  return ids;
}
