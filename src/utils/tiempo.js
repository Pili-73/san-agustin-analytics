export function formatearTiempo(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function fechaDeHoy() {
  // yyyy-MM-dd, formato nativo de <input type="date"> y de la columna "date" en Supabase
  return new Date().toISOString().slice(0, 10);
}

export function horaActual() {
  // HH:mm, formato nativo de <input type="time"> y de la columna "time" en Supabase
  return new Date().toTimeString().slice(0, 5);
}
