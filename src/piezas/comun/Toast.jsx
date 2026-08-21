// Aviso flotante que se desvanece solo, equivalente a Toast.makeText en Android.
// tipo: "info" (por defecto), "ok" (verde, p.ej. confirmación de guardado),
// "pendiente" (ámbar, guardado local a la espera de conexión) o "error".
export default function Toast({ mensaje, tipo = "info", onDismiss }) {
  if (!mensaje) return null;

  return (
    <div className={`toast toast--${tipo}`} onAnimationEnd={onDismiss}>
      {mensaje}
    </div>
  );
}
