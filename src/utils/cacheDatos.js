// Caché local (localStorage, sobrevive a cerrar la app) de lecturas a
// Supabase, para que las pantallas puedan cargar con datos guardados cuando
// no hay conexión (wifi de pabellón inestable, o directamente sin cobertura).
// No es una caché "cache-first": siempre se intenta la red primero, y solo
// se recurre a lo guardado si la consulta falla. Así los datos se mantienen
// frescos en cuanto hay conexión, sin necesitar invalidación explícita.
const PREFIJO = "cache-datos:";

function leer(clave) {
  try {
    const guardado = localStorage.getItem(`${PREFIJO}${clave}`);
    return guardado ? JSON.parse(guardado) : null;
  } catch (err) {
    console.error("No se pudo leer la caché local", err);
    return null;
  }
}

function guardar(clave, datos) {
  try {
    localStorage.setItem(`${PREFIJO}${clave}`, JSON.stringify(datos));
  } catch (err) {
    console.error("No se pudo guardar en la caché local", err);
  }
}

// Ejecuta `consulta`; si tiene éxito, refresca la caché de `clave` con el
// resultado. Si falla (sin conexión) y hay una copia guardada de una
// consulta anterior, la devuelve en su lugar; si no hay nada guardado,
// propaga el error tal cual (primera vez sin conexión, no hay nada que mostrar).
export async function conCache(clave, consulta) {
  try {
    const datos = await consulta();
    guardar(clave, datos);
    return datos;
  } catch (err) {
    const guardado = leer(clave);
    if (guardado != null) {
      console.warn(`Sin conexión: usando datos guardados para "${clave}"`, err);
      return guardado;
    }
    throw err;
  }
}
