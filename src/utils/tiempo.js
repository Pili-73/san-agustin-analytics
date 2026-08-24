export function formatearTiempo(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Inversa de formatearTiempo: de "mm:ss" a minutos (con decimales), para
// poder filtrar acciones por intervalo de tiempo. null si no es parseable.
export function minutosDeTiempo(tiempo) {
  if (!tiempo) return null;
  const [mm, ss] = tiempo.split(":").map(Number);
  if (Number.isNaN(mm) || Number.isNaN(ss)) return null;
  return mm + ss / 60;
}

// Inversa de formatearTiempo: de "mm:ss" a milisegundos, para restaurar el
// cronómetro a partir del tiempo guardado en la última acción de un
// partido. null si no es parseable.
export function msDeTiempo(tiempo) {
  const minutos = minutosDeTiempo(tiempo);
  return minutos != null ? Math.round(minutos * 60000) : null;
}

export function fechaDeHoy() {
  // yyyy-MM-dd, formato nativo de <input type="date"> y de la columna "date" en Supabase
  return new Date().toISOString().slice(0, 10);
}

export function horaActual() {
  // HH:mm, formato nativo de <input type="time"> y de la columna "time" en Supabase
  return new Date().toTimeString().slice(0, 5);
}
