import { useEffect, useState } from "react";

// Ejecuta `cargar()` al montar (o cuando cambian `deps`) y evita tocar el
// estado si el componente ya se desmontó. Centraliza el patrón "cargando /
// error / no actualizar tras desmontar" repetido en varias pantallas; quien
// llama sigue dueño de su propio estado de datos vía `onExito`.
export function useCargaAsync(cargar, { deps = [], onExito, mensajeError }) {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    cargar()
      .then((resultado) => {
        if (!activo) return;
        onExito(resultado);
        setError("");
      })
      .catch((err) => {
        console.error(mensajeError, err);
        if (activo) setError(mensajeError);
      })
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { cargando, error };
}
