// Colas de sincronización (sin conexión o wifi inestable de pabellón), en
// localStorage -no sessionStorage- para que sobrevivan aunque se cierre el
// navegador antes de recuperar la red. Dos colas independientes por partido:
// una de acciones por crear (ya existía) y otra de acciones por borrar (para
// poder deshacer una acción ya sincronizada aunque no haya conexión).
const PREFIJO_CREAR = "cola-sync:";
const PREFIJO_BORRAR = "cola-sync-borrar:";

function leer(prefijo, partidoId) {
  try {
    const guardado = localStorage.getItem(`${prefijo}${partidoId}`);
    return guardado ? JSON.parse(guardado) : [];
  } catch (err) {
    console.error("No se pudo leer la cola de sincronización", err);
    return [];
  }
}

function guardar(prefijo, partidoId, cola) {
  try {
    localStorage.setItem(`${prefijo}${partidoId}`, JSON.stringify(cola));
  } catch (err) {
    console.error("No se pudo guardar la cola de sincronización", err);
  }
}

function idsPartidosCon(prefijo) {
  const ids = [];
  for (let i = 0; i < localStorage.length; i++) {
    const clave = localStorage.key(i);
    if (clave?.startsWith(prefijo)) ids.push(clave.slice(prefijo.length));
  }
  return ids;
}

// --- Cola de creación (acciones nuevas pendientes de subir) ---

export function leerPendientes(partidoId) {
  return leer(PREFIJO_CREAR, partidoId);
}

// Solo las acciones (no el envoltorio {idLocal, accion}) de la cola de un
// partido, para poder mezclarlas con lo ya sincronizado al calcular
// estadísticas: así lo recién anotado sin conexión aparece ya en las cifras,
// sin esperar a que suba.
export function accionesPendientes(partidoId) {
  return leer(PREFIJO_CREAR, partidoId).map((item) => item.accion);
}

// Añade una acción a la cola y devuelve el id local (para poder deshacerla
// mientras siga sin sincronizar) y la cola resultante.
export function encolarAccion(partidoId, accion) {
  const idLocal = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const cola = [...leer(PREFIJO_CREAR, partidoId), { idLocal, accion }];
  guardar(PREFIJO_CREAR, partidoId, cola);
  return { idLocal, cola };
}

export function quitarDeCola(partidoId, idLocal) {
  const cola = leer(PREFIJO_CREAR, partidoId).filter((item) => item.idLocal !== idLocal);
  guardar(PREFIJO_CREAR, partidoId, cola);
  return cola;
}

// Saca el primer elemento de la cola y lo devuelve (o null si está vacía).
// Es atómica (lectura+escritura sin ningún `await` de por medio), así que dos
// reintentos a la vez -el del propio partido y el global de la app- nunca
// pueden llevarse el mismo elemento ni subirlo dos veces.
export function tomarSiguiente(partidoId) {
  const cola = leer(PREFIJO_CREAR, partidoId);
  if (cola.length === 0) return null;
  const [primero, ...resto] = cola;
  guardar(PREFIJO_CREAR, partidoId, resto);
  return primero;
}

// Si falla el intento de subida, el elemento vuelve al principio de la cola
// para no perder el orden ni el dato.
export function reencolar(partidoId, item) {
  guardar(PREFIJO_CREAR, partidoId, [item, ...leer(PREFIJO_CREAR, partidoId)]);
}

// Ids de partido con alguna acción pendiente, aunque ya no se esté viendo esa
// pantalla de Directo (p.ej. el partido se acabó offline y no se ha vuelto a
// abrir): permite un reintento a nivel de app, no solo mientras se juega.
export function idsPartidosConCola() {
  return idsPartidosCon(PREFIJO_CREAR);
}

// --- Cola de borrado (deshacer una acción ya sincronizada, sin conexión) ---
// Solo hace falta el id_accion del servidor: no hay nada más que reintentar,
// solo repetir el DELETE hasta que se confirme.

export function leerBorradosPendientes(partidoId) {
  return leer(PREFIJO_BORRAR, partidoId);
}

export function encolarBorrado(partidoId, idAccion) {
  const cola = [...leer(PREFIJO_BORRAR, partidoId), idAccion];
  guardar(PREFIJO_BORRAR, partidoId, cola);
  return cola;
}

export function tomarSiguienteBorrado(partidoId) {
  const cola = leer(PREFIJO_BORRAR, partidoId);
  if (cola.length === 0) return null;
  const [primero, ...resto] = cola;
  guardar(PREFIJO_BORRAR, partidoId, resto);
  return primero;
}

export function reencolarBorrado(partidoId, idAccion) {
  guardar(PREFIJO_BORRAR, partidoId, [idAccion, ...leer(PREFIJO_BORRAR, partidoId)]);
}

export function idsPartidosConColaBorrados() {
  return idsPartidosCon(PREFIJO_BORRAR);
}
